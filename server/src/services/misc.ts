const parse_products2 = async (html: string) => {
    try {
        const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4.1",
                instructions: `You are a product extraction assistant.

I will give you the full HTML source of a webpage. Your task is to extract a list of product offerings from the page.

For each product, return an object with the following keys:

name: the product name

price: the price (with currency symbol, e.g., "$29.99")

media: the image or video URL representing the product

The product data might be wrapped in divs, articles, list items, or other repeated structures. The HTML may not use consistent class names.

Ignore any banners, ads, or unrelated UI. Only extract actual products listed for sale.

Return your output as a JSON array.

Example format:

[
  {
    "name": "Wireless Mouse",
    "price": "$19.99",
    "media": "https://example.com/images/mouse.jpg"
  }
]`,
                input: html
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data.output[0].content[0]);

        return data.output[0].content[0].text;

    } catch (error) {
        console.error("Error parsing HTML:", error);
        throw new Error("Failed to parse HTML");
    }
}

// ________________________________________________________________________________________________________________________

interface Product {
  name: string;
  price: string;
  media: string;
  url: string;
}

interface ParseOptions {
  maxProducts?: number;
  minNameLength?: number;
  requirePrice?: boolean;
  requireImage?: boolean;
  baseUrl?: string;
  customSelectors?: {
    productContainers?: string[];
    names?: string[];
    prices?: string[];
    images?: string[];
    urls?: string[];
  };
}

interface SelectorPatterns {
  productContainers: string[];
  names: string[];
  prices: string[];
  images: string[];
  urls?: string[];
}

class ProductParser {
  private selectorPatterns: SelectorPatterns = {
    productContainers: [
      '[data-testid*="product"]',
      '.product-item',
      '.product-card',
      '.product-tile',
      '.item',
      '.product',
      '[class*="product"]',
      '[id*="product"]',
      '.grid-item',
      '.listing-item',
      '.card',
      '[class*="card"]',
      '[class*="item"]',
      '.search-result',
      '.result-item',
      '.listing',
      '[data-*="item"]',
      '.cell',
      '.box'
    ],
    names: [
      '[data-testid*="name"]',
      '[data-testid*="title"]',
      'h1', 'h2', 'h3', 'h4', 'h5',
      '.product-name',
      '.product-title',
      '.item-name',
      '.item-title',
      '.title',
      '.name',
      '[class*="title"]',
      '[class*="name"]',
      '[class*="heading"]',
      'a[href*="/product"]',
      'a[href*="/item"]',
      'a[href*="/p/"]',
      '.product-link',
      '[data-*="name"]',
      '[data-*="title"]',
      '.description h3',
      '.description h4',
      'strong',
      '.brand',
      '.model'
    ],
    prices: [
      '[data-testid*="price"]',
      '.price',
      '.cost',
      '.amount',
      '[class*="price"]',
      '[class*="cost"]',
      '[class*="amount"]',
      '[class*="money"]',
      '.currency',
      '[data-*="price"]',
      '.sale-price',
      '.current-price',
      '.final-price',
      '.retail-price'
    ],
    images: [
      '[data-testid*="image"]',
      '.product-image img',
      '.product-img img',
      '.item-image img',
      'img[alt*="product"]',
      'img[src*="product"]',
      'img[alt*="item"]',
      '.image img',
      'picture img',
      'img',
      '[data-*="image"] img'
    ]
  };

  private pricePatterns: RegExp[] = [
    /\$[\d,]+\.?\d*/g,
    /€[\d,]+\.?\d*/g,
    /£[\d,]+\.?\d*/g,
    /¥[\d,]+\.?\d*/g,
    /₹[\d,]+\.?\d*/g,
    /[\d,]+\.?\d*\s*(?:USD|EUR|GBP|CAD|AUD|INR|JPY)/gi,
    /(?:USD|EUR|GBP|CAD|AUD|INR|JPY)\s*[\d,]+\.?\d*/gi
  ];

  private attrKeywords = ['list', 'items', 'product', 'grid', 'group', 'collection'];

  private createDOMFromHTML(html: string): Document {
    // For browser environment
    if (typeof DOMParser !== 'undefined') {
      const parser = new DOMParser();
      return parser.parseFromString(html, 'text/html');
    }
    
    // For Node.js environment (requires jsdom)
    try {
      const { JSDOM } = require('jsdom');
      const dom = new JSDOM(html);
      return dom.window.document;
    } catch (error) {
      throw new Error('DOM parsing not available. Install jsdom for Node.js environment.');
    }
  }

  private isPriceLike(text: string): boolean {
    if (!text) return false;
    const cleaned = text.trim();
    return this.pricePatterns.some(pattern => pattern.test(cleaned));
  }

  private normalizePrice(text: string): string {
    if (!text) return '';
    for (const pattern of this.pricePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }
    return text.trim();
  }

  private elementHasKeywordAttr(el: Element, keywords: string[]): boolean {
    return Array.from(el.attributes).some(attr => {
      const keyVal = `${attr.name}=${attr.value}`.toLowerCase();
      return keywords.some(keyword => keyVal.includes(keyword));
    });
  }

  private findRepeatedChildGroups(parent: Element): Element[] {
    const children = Array.from(parent.children);
    const groups: Record<string, Element[]> = {};

    for (const child of children) {
      const key = child.className || child.tagName;
      if (!groups[key]) groups[key] = [];
      groups[key].push(child);
    }

    // Find the largest group with at least 2 elements
    const repeatedGroups = Object.values(groups).filter(group => group.length >= 2);
    if (repeatedGroups.length > 0) {
      // Return the largest group
      return repeatedGroups.reduce((largest, current) => 
        current.length > largest.length ? current : largest
      );
    }

    return [];
  }

  private findProductContainers(document: Document, containerSelectors: string[]): Element[] {
    const allContainers: Element[] = [];
    
    // Strategy 1: Use traditional selectors
    for (const selector of containerSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          const validContainers = Array.from(elements).filter(el => {
            const text = el.textContent?.trim() || '';
            const hasMinContent = text.length > 10 && text.length < 3000;
            const isNotPageContainer = !el.matches('body, main, .main, #main, .container, .wrapper, .content');
            return hasMinContent && isNotPageContainer;
          });
          allContainers.push(...validContainers);
        }
      } catch (e) {
        continue;
      }
    }

    // Strategy 2: Find elements with attribute keywords (from second implementation)
    const allElements = Array.from(document.querySelectorAll('*'));
    const attributeCandidates = allElements.filter(el =>
      this.elementHasKeywordAttr(el, this.attrKeywords)
    );

    for (const candidate of attributeCandidates) {
      const repeatedItems = this.findRepeatedChildGroups(candidate);
      if (repeatedItems.length >= 2) {
        allContainers.push(...repeatedItems);
      }
    }

    // Strategy 3: Find repeating patterns
    if (allContainers.length === 0) {
      allContainers.push(...this.findRepeatingPatterns(document));
    }

    return this.removeNestedContainers(allContainers);
  }

  private extractProductFromContainer(container: Element, selectors: SelectorPatterns, options: ParseOptions): Partial<Product> {
    return {
      name: this.extractName(container, selectors.names) ?? undefined,
      price: this.extractPrice(container, selectors.prices) ?? undefined,
      media: this.extractImage(container, selectors.images, options.baseUrl) ?? undefined,
      url: this.extractUrl(container, options.baseUrl) ?? undefined
    };
  }

  private extractName(container: Element, nameSelectors: string[]): string | null {
    const candidateNames: Array<{text: string, priority: number, element: Element}> = [];
    
    // Try each selector pattern with priority scoring
    nameSelectors.forEach((selector, index) => {
      try {
        const elements = container.querySelectorAll(selector);
        Array.from(elements).forEach(element => {
          const text = this.cleanText(
            element.textContent || 
            (element as HTMLImageElement).alt || 
            element.getAttribute('title') || 
            ''
          );
          
          if (text && text.length > 2 && !this.isPriceLike(text)) {
            let priority = nameSelectors.length - index;
            
            // Boost priority for certain indicators
            if (element.matches('h1, h2, h3, h4, h5')) priority += 10;
            if (element.matches('[class*="title"], [class*="name"]')) priority += 5;
            if (element.matches('a[href*="/product"], a[href*="/item"]')) priority += 8;
            if (element.closest('a')) priority += 3;
            
            // Penalize very long text
            if (text.length > 100) priority -= 5;
            
            // Penalize text with too many special characters
            const specialCharRatio = (text.match(/[^a-zA-Z0-9\s\-]/g) || []).length / text.length;
            if (specialCharRatio > 0.3) priority -= 3;
            
            candidateNames.push({ text, priority, element });
          }
        });
      } catch (e) {
        // continue;
      }
    });

    // Sort by priority and return the best candidate
    if (candidateNames.length > 0) {
      candidateNames.sort((a, b) => b.priority - a.priority);
      return candidateNames[0]?.text ?? null;
    }

    // Enhanced fallback: look for the most prominent text
    return this.findMostProminentText(container);
  }

  private extractPrice(container: Element, priceSelectors: string[]): string | null {
    // Try specific price selectors first
    for (const selector of priceSelectors) {
      try {
        const element = container.querySelector(selector);
        if (element) {
          const price = this.normalizePrice(element.textContent || '');
          if (price) return price;
        }
      } catch (e) {
        continue;
      }
    }

    // Enhanced fallback: search all elements for price patterns (from second implementation)
    const allElements = Array.from(container.querySelectorAll('*'));
    const priceElement = allElements.find(el => this.isPriceLike(el.textContent || ''));
    
    if (priceElement) {
      return this.normalizePrice(priceElement.textContent || '');
    }

    // Final fallback: search all text content
    const allText = container.textContent || '';
    return this.normalizePrice(allText);
  }

  private extractImage(container: Element, imageSelectors: string[], baseUrl: string = ''): string | null {
    for (const selector of imageSelectors) {
      try {
        const img = container.querySelector(selector) as HTMLImageElement;
        if (img) {
          const src = img.src || 
                     img.dataset.src || 
                     img.dataset.lazySrc || 
                     img.getAttribute('data-original') ||
                     img.getAttribute('data-lazy');
          
          if (src && this.isValidImageUrl(src)) {
            return this.resolveUrl(src, baseUrl);
          }
        }
      } catch (e) {
        continue;
      }
    }

    // Simple fallback for any image
    const img = container.querySelector('img, video') as HTMLImageElement | HTMLVideoElement;
    if (img && img.src) {
      return this.resolveUrl(img.src, baseUrl);
    }

    // Look for background images
    try {
      const elementsWithBg = container.querySelectorAll('[style*="background-image"]');
      for (const el of elementsWithBg) {
        const style = (el as HTMLElement).style.backgroundImage;
        const bgMatch = style.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (bgMatch && bgMatch[1] && this.isValidImageUrl(bgMatch[1])) {
          return this.resolveUrl(bgMatch[1], baseUrl);
        }
      }
    } catch (e) {
      // Continue without background image extraction
    }

    return null;
  }

  private extractUrl(container: Element, baseUrl: string = ''): string | null {
    const linkSelectors = [
      'a[href*="/product"]',
      'a[href*="/item"]', 
      'a[href*="/p/"]',
      'a[href*="/dp/"]',
      'a[href*="/pd/"]',
      'a[href*="/products/"]',
      'a[href*="/items/"]',
      'a[href]'
    ];
    
    for (const selector of linkSelectors) {
      try {
        const link = container.querySelector(selector) as HTMLAnchorElement;
        if (link && link.href) {
          const href = link.href;
          if (this.isValidProductUrl(href)) {
            const resolvedUrl = this.resolveUrl(href, baseUrl);
            if (this.hasValidDomain(resolvedUrl, baseUrl)) {
              return resolvedUrl;
            }
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    return null;
  }

  private extractFromFallback(document: Document, selectors: SelectorPatterns, options: ParseOptions): Product[] {
    const products: Product[] = [];
    const names = this.findAllElements(document, selectors.names);
    
    for (const nameEl of names.slice(0, options.maxProducts || 20)) {
      const productContainer = this.findClosestProductContainer(nameEl);
      const product = this.extractProductFromContainer(productContainer, selectors, options);
      
      if (this.isValidProduct(product, options)) {
        // Ensure all required fields are present with fallback values
        const validProduct: Product = {
          name: product.name!,
          price: product.price || '',
          media: product.media || '',
          url: product.url!
        };
        products.push(validProduct);
      }
    }

    return this.deduplicateProducts(products);
  }

  private mergeSelectors(customSelectors: ParseOptions['customSelectors'] = {}): SelectorPatterns {
    return {
      productContainers: [...(customSelectors.productContainers || []), ...this.selectorPatterns.productContainers],
      names: [...(customSelectors.names || []), ...this.selectorPatterns.names],
      prices: [...(customSelectors.prices || []), ...this.selectorPatterns.prices],
      images: [...(customSelectors.images || []), ...this.selectorPatterns.images],
      urls: [...(customSelectors.urls || []), 'a[href*="/product"]', 'a[href*="/item"]', 'a[href*="/p/"]', 'a']
    };
  }

  private removeNestedContainers(containers: Element[]): Element[] {
    return containers.filter(container => {
      return !containers.some(other => 
        other !== container && other.contains(container)
      );
    });
  }

  private findRepeatingPatterns(document: Document): Element[] {
    const candidates: Element[] = [];
    
    const elementsWithClasses = document.querySelectorAll('[class]');
    const classPatterns = new Map<string, Element[]>();
    
    Array.from(elementsWithClasses).forEach(el => {
      const classList = Array.from(el.classList);
      classList.forEach(className => {
        if (!classPatterns.has(className)) {
          classPatterns.set(className, []);
        }
        classPatterns.get(className)!.push(el);
      });
    });
    
    for (const [className, elements] of classPatterns) {
      if (elements.length >= 3 && elements.length <= 100) {
        const validElements = elements.filter(el => {
          const text = el.textContent?.trim() || '';
          return text.length > 20 && text.length < 1000;
        });
        
        if (validElements.length >= 3) {
          candidates.push(...validElements);
        }
      }
    }
    
    return this.removeNestedContainers(candidates);
  }

  private findMostProminentText(container: Element): string | null {
    const textCandidates: Array<{text: string, score: number}> = [];
    
    const allElements = container.querySelectorAll('*');
    
    Array.from(allElements).forEach(el => {
      const text = this.cleanText(el.textContent || '');
      if (text.length > 5 && text.length < 150 && !this.isPriceLike(text)) {
        let score = 0;
        
        if (el.matches('h1, h2, h3, h4, h5, h6')) score += 15;
        else if (el.matches('p, span, div')) score += 5;
        else if (el.matches('a')) score += 10;
        
        try {
          const style = window.getComputedStyle(el);
          const fontSize = parseFloat(style.fontSize);
          const fontWeight = style.fontWeight;
          
          if (fontSize > 16) score += 5;
          if (fontSize > 20) score += 5;
          if (fontWeight === 'bold' || parseInt(fontWeight) > 500) score += 5;
        } catch (e) {
          // Style not available
        }
        
        if (text.length < 50) score += 3;
        
        textCandidates.push({ text, score });
      }
    });
    
    if (textCandidates.length > 0) {
      textCandidates.sort((a, b) => b.score - a.score);
      return textCandidates[0]?.text ?? null;
    }
    
    return null;
  }

  private isValidProductUrl(url: string): boolean {
    if (!url || url.length < 5) return false;
    
    const invalidPatterns = [
      /javascript:/i,
      /mailto:/i,
      /tel:/i,
      /#$/,
      /\/(cart|checkout|login|register|account|search|category|categories|brand|brands|about|contact|help|support|privacy|terms)/i,
      /\.(pdf|doc|docx|xls|xlsx|zip|rar)$/i
    ];
    
    return !invalidPatterns.some(pattern => pattern.test(url));
  }

  // Checks if the resolvedUrl is from the same domain as baseUrl (or if baseUrl is not provided, always true)
  private hasValidDomain(resolvedUrl: string, baseUrl: string = ''): boolean {
    if (!baseUrl) return true;
    try {
      const base = new URL(baseUrl);
      const resolved = new URL(resolvedUrl, baseUrl);
      return base.hostname === resolved.hostname;
    } catch {
      return true;
    }
  }

  private cleanText(text: string): string {
    if (!text) return '';
    return text.trim()
      .replace(/\s+/g, ' ')
      .replace(/\n/g, ' ')
      .substring(0, 200);
  }

  private isValidImageUrl(url: string): boolean {
    if (!url || url.length < 4) return false;
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?|$)/i;
    return imageExtensions.test(url) || 
           url.includes('image') || 
           url.includes('img') ||
           url.includes('photo') ||
           url.startsWith('data:image/');
  }

  private resolveUrl(url: string, baseUrl: string): string {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    if (url.startsWith('//')) return 'https:' + url;
    if (url.startsWith('/') && baseUrl) {
      try {
        const base = new URL(baseUrl);
        return base.origin + url;
      } catch (e) {
        return url;
      }
    }
    return url;
  }

  private findAllElements(document: Document, selectors: string[]): Element[] {
    const elements: Element[] = [];
    for (const selector of selectors) {
      try {
        elements.push(...Array.from(document.querySelectorAll(selector)));
      } catch (e) {
        continue;
      }
    }
    return elements;
  }

  private findClosestProductContainer(element: Element): Element {
    let current: Element | null = element;
    for (let i = 0; i < 5; i++) {
      if (current?.parentElement) {
        current = current.parentElement;
        const hasImage = current.querySelector('img');
        const hasPrice = this.isPriceLike(current.textContent || '');
        const reasonableSize = (current.textContent || '').length < 500;
        
        if (hasImage && (hasPrice || reasonableSize)) {
          return current;
        }
      }
    }
    return element.parentElement || element;
  }

  private isValidProduct(product: Partial<Product>, options: ParseOptions = {}): product is Product {
    const { minNameLength = 3, requirePrice = false, requireImage = false } = options;
    
    // Check required fields - name and url are always required, price and media are optional
    if (!product.name || product.name.length < minNameLength) return false;
    if (!product.url || product.url.length < 5) return false;
    if (requirePrice && !product.price) return false;
    if (requireImage && !product.media) return false;
    
    // All products must have name and url at minimum
    return !!(product.name && 
              product.url && 
              (product.price || !requirePrice) && 
              (product.media || !requireImage));
  }

  private deduplicateProducts(products: Product[]): Product[] {
    const seen = new Set<string>();
    return products.filter(product => {
      const nameKey = product.name.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
      const priceKey = (product.price || '').replace(/[^\d.]/g, '');
      const urlKey = (product.url || '').split('?')[0];
      
      const key = `${nameKey}|${priceKey}|${urlKey}`;
      
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  public parse(html: string, options: ParseOptions = {}): Product[] {
    const {
      maxProducts = 50,
      minNameLength = 3,
      requirePrice = false,
      requireImage = false,
      customSelectors = {}
    } = options;

    try {
      const document = this.createDOMFromHTML(html);
      const selectors = this.mergeSelectors(customSelectors);
      
      // Find product containers using multiple strategies
      const containers = this.findProductContainers(document, selectors.productContainers);
      
      if (containers.length === 0) {
        return this.extractFromFallback(document, selectors, options);
      }

      const products: Product[] = [];
      
      for (const container of containers.slice(0, maxProducts)) {
        const product = this.extractProductFromContainer(container, selectors, options);
        
        if (this.isValidProduct(product, { minNameLength, requirePrice, requireImage })) {
          // Ensure all required fields are present with fallback values
          const validProduct: Product = {
            name: product.name!,
            price: product.price || '',
            media: product.media || '',
            url: product.url!
          };
          products.push(validProduct);
        }
      }

      return this.deduplicateProducts(products);
    } catch (error) {
      console.error('Error parsing products:', error);
      return [];
    }
  }
}

// Main function to export
export function parse_products(html: string, options?: ParseOptions): Product[] {
  const parser = new ProductParser();
  return parser.parse(html, options);
}

// Default export for convenience
export default parse_products;

// Usage examples:
/*
// Basic usage
const products = parse_products(htmlString);

// With options for better accuracy
const products = parse_products(htmlString, {
  maxProducts: 50,
  minNameLength: 3,
  requirePrice: false,
  requireImage: false,
  baseUrl: 'https://example.com',
  customSelectors: {
    productContainers: ['.my-product-class', '.product-wrapper'],
    names: ['.my-title-class', '.product-heading'],
    prices: ['.my-price-class', '.cost-display'],
    urls: ['.product-link', 'a.item-link']
  }
});

console.log(products);
// Output: [{ name: "Product Name", price: "$19.99", media: "https://...", url: "https://..." }, ...]
*/