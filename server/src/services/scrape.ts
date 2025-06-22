// const MAX_CHUNKS = 80;

// HTML preprocessing to reduce size
const preprocessHTML = (html: string): string => {
    return html
        // Remove comments
        .replace(/<!--[\s\S]*?-->/g, '')
        // Remove script tags and content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove style tags and content
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        // Remove unnecessary whitespace but preserve structure
        .replace(/\s+/g, ' ')
        // Remove empty lines
        .replace(/\n\s*\n/g, '\n')
        .trim();
};

// Helper function to resolve relative URLs
const resolveUrl = (url: string, baseUrl: string): string => {
    if (!url || !baseUrl) return url;
    
    try {
        
        if (url.includes(baseUrl)) {
          return url;
        } else if (url.startsWith('/')) {
          return `${baseUrl}${url}`;
        } else {
          return `${baseUrl}/${url}`;
        }

    } catch (error) {
        console.warn(`Failed to resolve URL "${url}" with base "${baseUrl}":`, error);
        return url;
    }
};

// Helper function to resolve image URLs
const resolveImageUrl = (imageUrl: string, baseUrl: string): string => {
    if (!imageUrl || !baseUrl) return imageUrl;
    
    try {
        // If it's already a complete URL, return as is
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        
        // Handle data URLs
        if (imageUrl.startsWith('data:')) {
            return imageUrl;
        }
        
        // Parse base URL to get domain info
        const base = new URL(baseUrl);
        const baseDomain = `${base.protocol}//${base.host}`;
        
        // Handle different relative URL patterns
        if (imageUrl.startsWith('//')) {
            // Protocol-relative URL
            return `${base.protocol}${imageUrl}`;
        } else if (imageUrl.startsWith('/')) {
            // Root-relative URL
            return `${baseDomain}${imageUrl}`;
        } else {
            // Relative path
            return `${baseDomain}/${imageUrl}`;
        }
    } catch (error) {
        console.warn(`Failed to resolve image URL "${imageUrl}" with base "${baseUrl}":`, error);
        return imageUrl;
    }
};

const chunkHTML = (html: string, maxChunkSize: number = 10000): string[] => {
    const preprocessed = preprocessHTML(html);

    if (preprocessed.length <= maxChunkSize) {
        return [preprocessed];
    }

    const chunks: string[] = [];

    // Common product container patterns
    const productPatterns = [
        /(<(?:div|article|section|li)[^>]*(?:class|id)="[^"]*(?:product|item|card|listing)[^"]*"[^>]*>[\s\S]*?<\/(?:div|article|section|li)>)/gi,
        /(<(?:div|article|section)[^>]*>[\s\S]*?<\/(?:div|article|section)>)/gi
    ];

    let bestSplit: string[] = [];

    for (const pattern of productPatterns) {
        const matches = preprocessed.match(pattern);
        if (matches && matches.length > 1) {
            bestSplit = matches;
            break;
        }
    }

    if (bestSplit.length === 0) {
        bestSplit = preprocessed.split(/(?=<(?:div|article|section|ul|ol))/);
    }

    let currentChunk = '';

    for (const section of bestSplit) {
        const potentialChunk = currentChunk + section;

        if (potentialChunk.length > maxChunkSize) {
            if (currentChunk.trim()) {
                chunks.push(currentChunk.trim());
            }

            if (section.length > maxChunkSize) {
                const forceSplit = section.match(/.{1,40000}/g) || [section];
                chunks.push(...forceSplit);
                currentChunk = '';
            } else {
                currentChunk = section;
            }
        } else {
            currentChunk = potentialChunk;
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    // Return only the first half of the chunks array
    // const half = Math.ceil(chunks.length / 2);
    // return chunks.slice(0, half).filter(chunk => chunk.length > 100);
    return chunks.filter(chunk => chunk.length > 100);

};

// Send individual chunk to OpenAI with detailed error handling
const processChunk = async (chunk: string, chunkIndex: number, baseUrl?: string): Promise<any[]> => {
    try {
        // Validate inputs first
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY environment variable is not set");
        }

        if (!chunk || chunk.trim().length === 0) {
            console.warn(`Chunk ${chunkIndex + 1} is empty, skipping`);
            return [];
        }

        const requestBody = {
            // model: "gpt-4.1", // Updated to current model
            model: "gpt-4o", // Updated to current model
            messages: [
                {
                    role: "system",
                    content: "You are a product extraction assistant. Extract product listings from HTML content. For each product, return an object with: name (string), price (string with currency), media (string URL for image/video), url (string URL that links to the product page). Return ONLY a valid JSON array, even if empty: []"
                },
                {
                    role: "user",
                    content: `Extract products from this HTML. Look for:
- Product names (in headings, titles, or product name elements)
- Prices (with currency symbols like $, €, £)
- Media URLs (img src attributes for product images)
- Product URLs (href attributes in links that go to individual product pages)

Common patterns:
- Product links: <a href="/product/123">, <a href="https://site.com/item/abc">
- Images: <img src="product-image.jpg" alt="Product Name">
- Prices: $19.99, €25.00, £15.50

IMPORTANT: Include ALL URLs as found in the HTML, even if they are relative paths like "/products/abc" or "product/abc"

HTML content:
${chunk.substring(0, 12000)}`
                }
            ],
            // max_tokens: 4000,
            // temperature: 0.1
        };

        // Log request details for debugging
        console.log(`Chunk ${chunkIndex + 1} - Content length: ${chunk.length}`);
        console.log(`Request body size: ${JSON.stringify(requestBody).length} characters`);

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });

        // Detailed error logging
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Chunk ${chunkIndex + 1} API Error:`);
            console.error(`Status: ${response.status} ${response.statusText}`);
            console.error(`Response: ${errorText}`);
            
            // Try to parse error details
            try {
                const errorData = JSON.parse(errorText);
                console.error(`Error details:`, errorData);
            } catch (e) {
                console.error(`Raw error response: ${errorText}`);
            }
            
            return [];
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error(`Chunk ${chunkIndex + 1}: Unexpected API response structure`, data);
            return [];
        }

        const content = data.choices[0].message.content;

        try {
            // Extract the first JSON array from the response, ignoring any extra text
            const match = content.match(/\[\s*{[\s\S]*?}\s*\]/);
            const jsonString = match ? match[0] : content;
            const products = JSON.parse(jsonString);
            
            if (Array.isArray(products)) {
                // Resolve relative URLs if baseUrl is provided
                if (baseUrl) {
                    return products.map(product => ({
                        ...product,
                        url: product.url ? resolveUrl(product.url, baseUrl) : product.url,
                        media: product.media ? resolveImageUrl(product.media, baseUrl) : product.media
                    }));
                }
                return products;
            }
            return [];
        } catch (parseError) {
            console.warn(`Chunk ${chunkIndex + 1}: Failed to parse JSON response:`);
            console.warn(`Content: ${content}`);
            return [];
        }
        
    } catch (error) {
        console.error(`Error processing chunk ${chunkIndex + 1}:`, error);
        return [];
    }
};

// Parallel processing with timeout and progressive results - MODIFIED TO STOP AT 10 PRODUCTS
const parse_products = async (
    html: string, 
    baseUrl?: string,           // NEW: Base URL for resolving relative URLs
    maxWaitTime: number = 120000, // 2 minutes default timeout
    maxConcurrency: number = 3,   // Max parallel requests
    // maxProducts: number = 10,     // NEW: Maximum number of products to extract
    maxProducts: number = 15,     // NEW: Maximum number of products to extract
    onProgress?: (products: any[], completedChunks: number, totalChunks: number) => void
) => {
    try {
        console.log(`Original HTML size: ${html.length} characters`);
        console.log(`Will stop after extracting ${maxProducts} products`);
        if (baseUrl) {
            console.log(`Base URL for resolving relative URLs: ${baseUrl}`);
        }
        
        // Create chunks
        const chunks = chunkHTML(html);
        console.log(`Split into ${chunks.length} chunks`);
        
        // Log chunk sizes for debugging
        chunks.forEach((chunk, i) => {
            console.log(`Chunk ${i + 1}: ${chunk.length} characters`);
        });
        
        const allProducts: any[] = [];
        const completedChunks = new Set<number>();
        const failedChunks = new Set<number>();
        let processedCount = 0;
        let shouldStop = false; // NEW: Flag to stop processing
        
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Processing timed out after ${maxWaitTime}ms`));
            }, maxWaitTime);
        });
        
        // Process chunks with concurrency control - MODIFIED TO STOP AT MAX PRODUCTS
        const processChunksWithConcurrency = async (): Promise<any[]> => {
            const semaphore = new Array(maxConcurrency).fill(null);
            let chunkIndex = 0;
            
            const processNextChunk = async (): Promise<void> => {
                while (chunkIndex < chunks.length && !shouldStop) {
                    const currentIndex = chunkIndex++;
                    
                    try {
                        console.log(`Starting chunk ${currentIndex + 1}/${chunks.length}...`);
                        console.log(`Current product count: ${allProducts.length}/${maxProducts}`);
                        
                        const chunkProducts = await processChunk(chunks[currentIndex]!, currentIndex, baseUrl);
                        
                        // Check if adding these products would exceed our limit
                        const productsToAdd = chunkProducts.slice(0, maxProducts - allProducts.length);
                        
                        // Safely add products to shared array
                        allProducts.push(...productsToAdd);
                        completedChunks.add(currentIndex);
                        processedCount++;
                        
                        console.log(`✅ Chunk ${currentIndex + 1} completed: ${productsToAdd.length} products added (${chunkProducts.length} found)`);
                        console.log(`Progress: ${processedCount}/${chunks.length} chunks completed, ${allProducts.length}/${maxProducts} products extracted`);
                        
                        // Check if we've reached our product limit
                        if (allProducts.length >= maxProducts) {
                            shouldStop = true;
                            console.log(`🎯 Reached target of ${maxProducts} products! Stopping extraction.`);
                        }
                        
                        // Call progress callback if provided
                        if (onProgress) {
                            const currentProducts = [...allProducts]; // Create copy for callback
                            onProgress(currentProducts, processedCount, chunks.length);
                        }
                        
                    } catch (error) {
                        failedChunks.add(currentIndex);
                        console.error(`❌ Chunk ${currentIndex + 1} failed:`, error);
                    }
                }
            };
            
            // Start concurrent processing
            const workers = semaphore.map(() => processNextChunk());
            await Promise.all(workers);
            
            return allProducts;
        };
        
        // Race between processing and timeout
        try {
            console.log(`Starting parallel processing with max ${maxConcurrency} concurrent requests...`);
            const startTime = Date.now();
            
            await Promise.race([
                processChunksWithConcurrency(),
                timeoutPromise
            ]);
            
            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;
            
            console.log(`\n=== Processing Complete ===`);
            console.log(`Duration: ${duration.toFixed(2)} seconds`);
            console.log(`Completed chunks: ${completedChunks.size}/${chunks.length}`);
            console.log(`Failed chunks: ${failedChunks.size}/${chunks.length}`);
            console.log(`Total products extracted: ${allProducts.length}`);
            console.log(`Target reached: ${allProducts.length >= maxProducts ? 'Yes' : 'No'}`);
            
            if (failedChunks.size > 0) {
                console.warn(`⚠️  Warning: ${failedChunks.size} chunks failed to process`);
                console.warn(`Failed chunk indices: ${Array.from(failedChunks).map(i => i + 1).join(', ')}`);
            }
            
            if (shouldStop && allProducts.length >= maxProducts) {
                console.log(`✅ Successfully stopped after reaching ${maxProducts} products`);
            }
            
        } catch (error) {
            if (typeof error === "object" && error !== null && "message" in error && typeof (error as any).message === "string" && (error as any).message.includes('timed out')) {
                console.warn(`⏰ Processing timed out after ${maxWaitTime}ms`);
                console.log(`Partial results: ${allProducts.length} products from ${completedChunks.size}/${chunks.length} chunks`);
            } else {
                throw error;
            }
        }
        
        // Remove duplicates based on name, price, and url
        const uniqueProducts = allProducts.filter((product, index, self) => 
            index === self.findIndex(p => 
                p.name === product.name && 
                p.price === product.price && 
                p.url === product.url
            )
        );
        
        // Ensure we don't exceed the max products limit after deduplication
        const finalProducts = uniqueProducts.slice(0, maxProducts);
        
        console.log(`Unique products after deduplication: ${uniqueProducts.length}`);
        console.log(`Final products returned: ${finalProducts.length}`);
        
        // Return results even if some chunks failed or timed out
        return {
            products: finalProducts,
            metadata: {
                totalChunks: chunks.length,
                completedChunks: completedChunks.size,
                failedChunks: failedChunks.size,
                processingTimeMs: Date.now() - Date.now(), // Will be calculated properly
                timedOut: failedChunks.size > 0 || completedChunks.size < chunks.length,
                baseUrl: baseUrl || null,
                maxProducts: maxProducts,
                targetReached: finalProducts.length >= maxProducts,
                stoppedEarly: shouldStop
            }
        };
        
    } catch (error) {
        console.error("Error in chunked parsing:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to parse HTML with chunking: ${error.message}`);
        } else {
            throw new Error(`Failed to parse HTML with chunking: ${String(error)}`);
        }
    }
};

// Helper function for easy JSON string return (backward compatibility) - UPDATED WITH NEW PARAMETER
const parse_products_json = async (
    html: string, 
    baseUrl?: string,          
    maxWaitTime?: number, 
    maxConcurrency?: number,
    maxProducts: number = 10  
): Promise<string> => {
    const result = await parse_products(html, baseUrl, maxWaitTime, maxConcurrency, maxProducts);
    return JSON.stringify(result.products, null, 2);
};

export { parse_products, parse_products_json, chunkHTML, preprocessHTML, resolveUrl, resolveImageUrl };