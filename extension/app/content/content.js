console.log("Swipify: _____content.js_____ loaded");

// ------------------------------------------ Event Listeners -------------------------------------------- //

// wait for window to load
window.addEventListener("load", async () => {
    
    // __________________________________________PORT FOR SERVICE WORKER__________________________________________
    await chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        const action = request.action
        
        switch(action){

          case 'refresh':
            setTimeout(()=>{
              sendMessage('refresh')
            }, 20000)
            break;
          case 'test':
            console.log('Swipify')
              openOverLay()
            break
          default:
            console.log('Swipify - received message:', request);
            break;
        }
      }
    );

    const sendMessage = async (msg) => {
      try {
        await chrome.runtime.sendMessage(msg)
      } catch (e){
        return false
      }
      return true
    }

    
    await sendMessage({action: 'test', msg: 'Attaching service worker listener'})
    

    // ------------------------------------------ Attach Elements -------------------------------------------- //

  let currentCardElem = null
  let currentDeck = []
  let currentDeckElems = []
  let currentCardIndex = 0

  const liked_products = []

  const likeCurrentCard = () => {
    liked_products.push(currentDeck[currentCardIndex])
    console.log(liked_products)
  }

  const sendCard = async (dir) => {
    if (dir == 'right') likeCurrentCard()
    currentCardElem.classList.add(`${dir}-swiped`);
  }

 // Fixed createCard function with proper event handling
const createCard = async (product_name, price, url, media_url) => {
  const card = document.createElement('swipify-card');

  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let dragMoved = false;

  card.style.transition = "transform 0.2s";

  // Mouse down event - start dragging
  card.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    card.style.transition = "none";
    document.body.style.userSelect = "none";
    
    // Ensure this card is the current active card
    const cardIndex = currentDeckElems.indexOf(card);
    if (cardIndex !== -1) {
      currentCardIndex = cardIndex;
      updateCurrentCard();
    }
  });

  // Mouse move event - handle dragging
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    offsetX = e.clientX - startX;
    offsetY = e.clientY - startY;
    
    // If mouse moved more than a few pixels, consider it a drag
    if (Math.abs(offsetX) > 2 || Math.abs(offsetY) > 2) {
      dragMoved = true;
    }
    
    const rotate = Math.max(-15, Math.min(15, offsetX / 10));
    card.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotate}deg)`;

    // Hover effect for swipe buttons based on card position
    const swipeLeftBtn = document.querySelector('swipify-swipe-left');
    const swipeRightBtn = document.querySelector('swipify-swipe-right');
    if (swipeLeftBtn && swipeRightBtn) {
      const hoverThreshold = 250; // Threshold for button hover effects
      
      if (offsetX < -hoverThreshold) {
        swipeLeftBtn.classList.add('excited');
        swipeRightBtn.classList.remove('excited');
      } else if (offsetX > hoverThreshold) {
        swipeRightBtn.classList.add('excited');
        swipeLeftBtn.classList.remove('excited');
      } else {
        swipeLeftBtn.classList.remove('excited');
        swipeRightBtn.classList.remove('excited');
      }
    }
  };


 const handleMouseUp = (e) => {
  if (!isDragging) return;

  isDragging = false;
  document.body.style.userSelect = "";

  // Reset excited state on swipe buttons
  const swipeLeftBtn = document.querySelector('swipify-swipe-left');
  const swipeRightBtn = document.querySelector('swipify-swipe-right');
  if (swipeLeftBtn) swipeLeftBtn.classList.remove('excited');
  if (swipeRightBtn) swipeRightBtn.classList.remove('excited');

  // Remove custom transform and transition styling from dragging
  card.style.transition = "";
  card.style.transform = "";

  // Remove tilt classes
  card.classList.remove('left-tilt', 'right-tilt');

  // Check if card should be swiped or snapped back
  const cardRect = card.getBoundingClientRect();
  const threshold = cardRect.width * 0.2;

  if (offsetX < -threshold) {
    card.style.transition = "transform 0.3s ease-out";
    sendCard('left');
    handleClick();
  } else if (offsetX > threshold) {
    card.style.transition = "transform 0.3s ease-out";
    sendCard('right');
    handleClick();
  } else {
    // Snap back to center with bounce
    card.style.transition = "transform 0.3s ease-out";
    card.style.transform = "translate(0px, 0px) rotate(0deg)";
    setTimeout(() => {
      card.style.transition = "transform 0.1s ease-in-out";
      card.style.transform = "translate(0px, 0px) rotate(0deg) scale(1.02)";
      setTimeout(() => {
        card.style.transform = "translate(0px, 0px) rotate(0deg) scale(1)";
        setTimeout(() => {
          card.style.transition = "";
          card.style.transform = "";
          card.classList.remove('left-tilt', 'right-tilt');
        }, 100);
      }, 50);
    }, 200);
  }

  // Clean up event listeners
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);

  setTimeout(() => {
    offsetX = 0;
    offsetY = 0;
    dragMoved = false;
  }, 10);
};

  // Add event listeners when dragging starts
  card.addEventListener('mousedown', (e) => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  });

  // Click handler for opening product links
  card.addEventListener('click', (e) => {
    // Prevent click if it was a drag (check both dragMoved flag and actual distance)
    if (dragMoved || Math.abs(offsetX) > 5 || Math.abs(offsetY) > 5) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (url) {
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
    }
  });

  // Create card content
  const image_container = document.createElement('div');
  image_container.classList.add('image-container');

  const image = document.createElement('img');
  image.src = media_url;
  image.alt = product_name;

  image_container.appendChild(image);

  const info = document.createElement('div');
  info.classList.add('info');

  const title = document.createElement('h3');
  title.textContent = product_name;
  title.classList.add('title');

  const priceElement = document.createElement('p');
  priceElement.textContent = price;
  priceElement.classList.add('price');
  
  info.appendChild(title);
  info.appendChild(priceElement);
  card.appendChild(image_container);
  card.appendChild(info);

  return card;
};

  const updateCurrentCard = () => {
    if (currentCardIndex >= 0) currentCardElem = currentDeckElems[currentCardIndex]
    else {
      currentCardElem = null
    }
  }

  const loadCards = async (card_list) => {
    currentDeck = card_list
    currentDeckElems = []
    currentCardIndex = card_list.length - 1
    const deck = document.querySelector('swipify-deck');
    if (deck) {
      deck.innerHTML = ''; // Clear existing cards
      for (const cardData of card_list) {
        const card = await createCard(cardData.name, cardData.price, cardData.url, cardData.media);
        currentDeckElems.push(card)
        deck.appendChild(card);
      }
    } else {
      console.error('Deck element not found');
    }
    updateCurrentCard()
    console.log(card_list, currentDeckElems, currentCardIndex, currentCardElem)
  }

  const handleClick = () => {
      if (currentCardIndex >= 0){
        currentCardIndex -= 1
        updateCurrentCard()
      }
    }

  const findCurrentCard = () => {
    if (currentDeckElems.length === 0) return null;
    return currentDeckElems[currentCardIndex] || null;
  }

  const openOverLay = () => {
    const overlay = document.querySelector('swipify-overlay')
    overlay.classList.remove('hidden')
  }
  
  const closeOverlay = () => {
    const overlay = document.querySelector('swipify-overlay')
    overlay.classList.add('hidden')
  }

  const attachElements = async () => {


    const handleMouseover = (dir) => {
      const deck = document.querySelector('swipify-deck');
      if (deck) {
        const card = findCurrentCard();
        if (card) {
          card.classList.add(`${dir}-tilt`);
        }
      }
    }
    const handleMouseout = (dir) => {
      const card = findCurrentCard();
      if (card) {
        card.classList.remove(`${dir}-tilt`);
      }
    }

    const overlay = document.createElement('swipify-overlay');
    overlay.classList.add('hidden')

    const exit = document.createElement('swipify-exit');
    const exit_img = document.createElement('img')
    exit_img.src = await chrome.runtime.getURL('assets/images/x.png');
    exit.appendChild(exit_img)
    exit.addEventListener('click', () => {closeOverlay()});

    const swipe_left = document.createElement('swipify-swipe-left');
    swipe_left.classList.add('swipe-button');

    const sl_image = document.createElement('img');
    sl_image.src = await chrome.runtime.getURL('assets/images/x.png');
    swipe_left.appendChild(sl_image);
    
    swipe_left.addEventListener('click', () => {
      if (currentCardElem) {
        sendCard('left')
        handleClick()
      }
    });
    swipe_left.addEventListener('mouseover', () => {handleMouseover('left')})
    swipe_left.addEventListener('mouseout', () => {handleMouseout('left')})
    
    const swipe_right = document.createElement('swipify-swipe-right');
    swipe_right.classList.add('swipe-button');

    const sr_image = document.createElement('img');
    sr_image.src = await chrome.runtime.getURL('assets/images/heart.png');
    swipe_right.appendChild(sr_image);

    swipe_right.addEventListener('click', () => {
    })
    
    swipe_right.addEventListener('click', () => {
      if (currentCardElem) {
        // likeCurrentCard()
        sendCard('right')
        handleClick()
      }
    });
    swipe_right.addEventListener('mouseover', () => {handleMouseover('right')})
    swipe_right.addEventListener('mouseout', () => {handleMouseout('right')})
    
    const deck = document.createElement('swipify-deck');

    const empty_message = document.createElement('swipify-message')
    empty_message.innerText = 'end of results | go to new pages for more | (っ °Д °;)っ'

    overlay.appendChild(exit);
    overlay.appendChild(empty_message)
    
    overlay.appendChild(swipe_left);
    overlay.appendChild(deck); 
    overlay.appendChild(swipe_right);

    document.body.appendChild(overlay);
  }

  await attachElements();

  const test = [
    {
        "name": "2017 Subaru BRZ.",
        "price": "FREE",
        "media": "https://scontent.fyto1-2.fna.fbcdn.net/v/t45.5328-4/510762051_23958004600518230_7463150192241924817_n.jpg?stp=c53.0.260.260a_dst-jpg_p261x260_tt6&_nc_cat=106&ccb=1-7&_nc_sid=247b10&_nc_ohc=vitoJ2SnUuQQ7kNvwHv2J3P&_nc_oc=AdlC3aZe06mzcBTTBG2FmOGqpFECDJItSgY5QkCxsSR0TZbbxPm7Rngn9IOUUDdN-lc&_nc_zt=23&_nc_ht=scontent.fyto1-2.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfMLMuBdM1Q_Qqq0RnVckyhD3Woyu5oQTdynuVtnsq_3NA&oe=685D2072",
        "url": "www.facebook.com/marketplace/item/2174296036349391/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "MASSIVE COLLECTION of Pokemon Plush! Charizard, Eevee, Eeveelutions, Blastoise, Mew, Mewtwo! $10 ea",
        "price": "CA$10",
        "media": "https://scontent.fyto1-2.fna.fbcdn.net/v/t45.5328-4/498595888_683165417670232_7280312255878692394_n.jpg?stp=c170.0.260.260a_dst-jpg_p261x260_tt6&_nc_cat=106&ccb=1-7&_nc_sid=247b10&_nc_ohc=KWVe8cFvdhwQ7kNvwEm-vPV&_nc_oc=AdlyGGiiCRMGnjmpxMDrRt0b1XsjR9z5cZZleYjnHG_kmVJJJlbIKNKkJVgq5HI3gJM&_nc_zt=23&_nc_ht=scontent.fyto1-2.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfP1G5s65zjRYFAR5ABYhq4O5aFsqPsGYshwaFakt4sfbA&oe=685D1EDA",
        "url": "www.facebook.com/marketplace/item/923557669825536/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "Labubu Macaron Flower Bouquet",
        "price": "CA$1",
        "media": "https://scontent.fyto1-2.fna.fbcdn.net/v/t45.5328-4/509271685_1031349992520147_6378060281591667395_n.jpg?stp=c0.159.261.261a_dst-jpg_p261x260_tt6&_nc_cat=102&ccb=1-7&_nc_sid=247b10&_nc_ohc=ddxDLPqDSo0Q7kNvwGG2ovQ&_nc_oc=Admd37yBLCeHRoTyHp3qUR9QRzYQuPtyXZiCoXNtFrroi_5FCO-Ihgh53AGNVhCndOM&_nc_zt=23&_nc_ht=scontent.fyto1-2.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfOIeiTvzmvD8yMsHqw9aDvuG4w4vNRXbWx0zhMPqlVzfQ&oe=685D1B9A",
        "url": "www.facebook.com/marketplace/item/1789124378333841/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "Custom Pikachu with The Starry Night",
        "price": "CA$5",
        "media": "https://scontent.fyto1-2.fna.fbcdn.net/v/t45.5328-4/509271685_1031349992520147_6378060281591667395_n.jpg?stp=c0.159.261.261a_dst-jpg_p261x260_tt6&_nc_cat=102&ccb=1-7&_nc_sid=247b10&_nc_ohc=ddxDLPqDSo0Q7kNvwGG2ovQ&_nc_oc=Admd37yBLCeHRoTyHp3qUR9QRzYQuPtyXZiCoXNtFrroi_5FCO-Ihgh53AGNVhCndOM&_nc_zt=23&_nc_ht=scontent.fyto1-2.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfOIeiTvzmvD8yMsHqw9aDvuG4w4vNRXbWx0zhMPqlVzfQ&oe=685D1B9A",
        "url": "www.facebook.com/marketplace/item/3831105483847204/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "Selling girlfriend’s premium minifridge",
        "price": "CA$200",
        "media": "https://scontent.fyto1-2.fna.fbcdn.net/v/t45.5328-4/504256888_2129716747512915_6460000412218803529_n.jpg?stp=c0.43.261.261a_dst-jpg_p261x260_tt6&_nc_cat=107&ccb=1-7&_nc_sid=247b10&_nc_ohc=d_Ca6VbFvAwQ7kNvwGZ_dBE&_nc_oc=AdkUIihpXmbM13V8VZrU1Llfqa9hOCTw9JhogqzRC5Eby_DakiFw9ZrAgGMsPq3pjBc&_nc_zt=23&_nc_ht=scontent.fyto1-2.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfN1fNjt1p3sTTgtVrXFVV_x6yGYS7SNMyWeXaUj7GeRWA&oe=685D1D31",
        "url": "www.facebook.com/marketplace/item/725179179980411/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "Nintendo switch games",
        "price": "CA$10",
        "media": "https://scontent.fyto1-2.fna.fbcdn.net/v/t45.5328-4/503476631_3602901323185981_3676655644822918299_n.jpg?stp=c0.43.261.261a_dst-jpg_p261x260_tt6&_nc_cat=109&ccb=1-7&_nc_sid=247b10&_nc_ohc=JlHlJgTVWgAQ7kNvwE0zIvT&_nc_oc=Adl40SsDMYPreeAlYfi71S-L5XPo94lA-87IsQvn_tFQSmIrGCBRaYDMtI_ONigdaQY&_nc_zt=23&_nc_ht=scontent.fyto1-2.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfOlIqdxaljl8Yz_x8ZuCmOn5_m2LT4LNx9YRtYUeUWm4Q&oe=685CF176",
        "url": "www.facebook.com/marketplace/item/1720382691902820/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "White cotton bloomers (2T)",
        "price": "CA$1",
        "media": "https://scontent.fyto1-1.fna.fbcdn.net/v/t45.5328-4/498096314_748201820938482_5864884591827645088_n.jpg?stp=c0.151.261.261a_dst-jpg_p261x260_tt6&_nc_cat=104&ccb=1-7&_nc_sid=247b10&_nc_ohc=fvW3JEEUVlUQ7kNvwFQyowh&_nc_oc=AdlGRZWdLBMY6n8lNKe82QOTbOpR_kpSRMjEnVqfnR9Kv5PZx0OdV6szxlCh0u_vURQ&_nc_zt=23&_nc_ht=scontent.fyto1-1.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfOp1lKK1hlraxYRa07-r08-68j_5U87OxByM0AEqVNgYQ&oe=685CFE7A",
        "url": "www.facebook.com/marketplace/item/616118871446200/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "1985 Porsche 944",
        "price": "CA$7,000",
        "media": "https://scontent.fyto1-1.fna.fbcdn.net/v/t45.5328-4/508107064_1214860816591307_7925823456754449552_n.jpg?stp=c43.0.260.260a_dst-jpg_p261x260_tt6&_nc_cat=111&ccb=1-7&_nc_sid=247b10&_nc_ohc=LCnGISUbNhsQ7kNvwGLuM9z&_nc_oc=AdndY3FKaXtVroec1VAoHtUzVDs7tQWbJsyuvHDcPkWXm-x3CmxBoiG4rhb0HIMuPo4&_nc_zt=23&_nc_ht=scontent.fyto1-1.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfNQHv1S9hPgB0t-fhaAEv_sdG_BqUB9Dvk7ck1JVtbe6A&oe=685CFD4A",
        "url": "www.facebook.com/marketplace/item/713488591570807/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "Store Closing (READ DESCRIPTION)",
        "price": "CA$5",
        "media": "https://scontent.fyto1-2.fna.fbcdn.net/v/t45.5328-4/502685263_1386486745898812_1078503069197995514_n.jpg?stp=c0.43.261.261a_dst-jpg_p261x260_tt6&_nc_cat=110&ccb=1-7&_nc_sid=247b10&_nc_ohc=i3PzP6zmJuoQ7kNvwGYdtIz&_nc_oc=Adlltrrn28F2sAxxPpr9XkDR8C_cdRJX9IhQfQ2fEv-MrlqgNkFgSQDn0lXvL7sM8VY&_nc_zt=23&_nc_ht=scontent.fyto1-2.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfOMAwW0L-RlWFe3AG1_vXuAZAj_cLE3MhR7azt9dN5Q-g&oe=685D1DCF",
        "url": "www.facebook.com/marketplace/item/1233092698272192/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "5 Beds 7 Baths House",
        "price": "CA$5",
        "media": "https://scontent.fyto1-2.fna.fbcdn.net/v/t45.5328-4/484550742_1423218492379224_8045045911961186767_n.jpg?stp=c43.0.260.260a_dst-jpg_p261x260_tt6&_nc_cat=110&ccb=1-7&_nc_sid=247b10&_nc_ohc=eUB-d1th4VIQ7kNvwEDuSl3&_nc_oc=AdnPwN8yygXqPzxQccoNeYuGNc1ZDCfdJTYTU5GqWp4JK8-Vj0xszVYOQMwaAWeMKXA&_nc_zt=23&_nc_ht=scontent.fyto1-2.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfN7Jyg3osP2_jgb50Hpj_ETzFV5CP3XrJ16_kP4gazcsg&oe=685CFFBB",
        "url": "www.facebook.com/marketplace/item/1174137641018696/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "not sure what the inches are TV for sale has a faint red line in the right side works perfectly fi",
        "price": "CA$100",
        "media": "https://scontent.fyto1-2.fna.fbcdn.net/v/t45.5328-4/508748708_1455659525849654_4870266930669429643_n.jpg?stp=c151.0.260.260a_dst-jpg_p261x260_tt6&_nc_cat=101&ccb=1-7&_nc_sid=247b10&_nc_ohc=mewtlaMylXwQ7kNvwFe1cq5&_nc_oc=AdmlQhaSiqlmtl2hlMA5v_JMJUusZSIjcqyF5pP5zy2TT_wMPmD11Bll0TmanYaJfIY&_nc_zt=23&_nc_ht=scontent.fyto1-2.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfN9I0-nu0WujIlGIBXQ9_QIdITq-wmfd2NRng_KhnjNQg&oe=685D0D71",
        "url": "www.facebook.com/marketplace/item/24506868118916412/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "Kids’ Pikachu suits and sumo fighter inflatable suits",
        "price": "CA$40",
        "media": "https://scontent.fyto1-1.fna.fbcdn.net/v/t45.5328-4/508745740_1251104686650930_1525843709270317651_n.jpg?stp=c43.0.260.260a_dst-jpg_p261x260_tt6&_nc_cat=108&ccb=1-7&_nc_sid=247b10&_nc_ohc=Rh17vg1i1VMQ7kNvwEmyEfJ&_nc_oc=Adk7ca0e9PD4JjxcNTHvtdvKvcKxmLBiewVdsbHsF1i1HaQLPLQ9TwWQBKe1ngNv_Xk&_nc_zt=23&_nc_ht=scontent.fyto1-1.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfNQVGr0C66PZaRj_fmiOdSCqVpXXcrRRkdam_ZK88Rr4g&oe=685D0054",
        "url": "www.facebook.com/marketplace/item/959395336197107/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "University of Toronto Tumbler",
        "price": "FREE",
        "media": "https://scontent.fyto1-1.fna.fbcdn.net/v/t45.5328-4/508727337_1386510119231722_1174174643795412863_n.jpg?stp=c0.43.261.261a_dst-jpg_p261x260_tt6&_nc_cat=105&ccb=1-7&_nc_sid=247b10&_nc_ohc=Sw3MA-AJ1xQQ7kNvwGlW-nx&_nc_oc=Adme5sRgHonaBJoqIp8XCheoeON8b_bAhT_W2Jww53PY90979eoMGrYwCDEjtxc2gNA&_nc_zt=23&_nc_ht=scontent.fyto1-1.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfNWrrXe6eClFb53TljirTdlCJScZkCPtjAhM9cG0m6kEA&oe=685CFF2C",
        "url": "www.facebook.com/marketplace/item/2201422763644949/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "Electric bike, YES IT'S AVAILABLE",
        "price": null,
        "media": "https://scontent.fyto1-2.fna.fbcdn.net/v/t45.5328-4/496206010_657759463825358_124377558489792399_n.jpg?stp=c43.0.260.260a_dst-jpg_p261x260_tt6&_nc_cat=110&ccb=1-7&_nc_sid=247b10&_nc_ohc=UXfUfMr-258Q7kNvwHOWPoZ&_nc_oc=AdmE9zXS7K2cRBpfJIfjA-8mRlmruOjKI9noeIv8RbBJUHW6D0MTFDMIWjJNLQ3NlCk&_nc_zt=23&_nc_ht=scontent.fyto1-2.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfOEoPWiiF_XWU-9DyAbHoQOaa1BKrFtjGAabd2evn2Vow&oe=685D0D05",
        "url": "www.facebook.com/marketplace/item/669071762652171/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "Rainy Day in Bobcaygeon",
        "price": "CA$400",
        "media": "https://scontent.fyto1-1.fna.fbcdn.net/v/t45.5328-4/507568711_1634880380500177_6970595486746189939_n.jpg?stp=c43.0.260.260a_dst-jpg_p261x260_tt6&_nc_cat=1&ccb=1-7&_nc_sid=247b10&_nc_ohc=8oOKNKHU3MwQ7kNvwFsXlSP&_nc_oc=AdmLwWcs1TWNzJwvd7CltohuGCuqBwcbTo0cPIqBWPpC_VmX7tPKDKh6dftnZcjQZsU&_nc_zt=23&_nc_ht=scontent.fyto1-1.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfNw1nglLQt9f3fIXcpvQs5Vy9-R4ARyG6mqslc1g9vcPA&oe=685D065E",
        "url": "www.facebook.com/marketplace/item/1150326440472779/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "Yoda backpack",
        "price": "CA$50",
        "media": "https://scontent.fyto1-1.fna.fbcdn.net/v/t45.5328-4/509771576_699572732704757_7918388899648466666_n.jpg?stp=c70.0.260.260a_dst-jpg_p261x260_tt6&_nc_cat=111&ccb=1-7&_nc_sid=247b10&_nc_ohc=W6l-3pwXCQUQ7kNvwHUsAGF&_nc_oc=AdkftHSOKLZltHH92pW9VkFu5MNit0Jcgjta0Pz72Pl2m-lOApPmeJxkBOdrcCPcq-E&_nc_zt=23&_nc_ht=scontent.fyto1-1.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfNDEBgOr2bOqwS44KQ4fcMsBRTX52GCiFbSvbwYzMt_qw&oe=685CF220",
        "url": "www.facebook.com/marketplace/item/30881713021419501/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    },
    {
        "name": "Twix cheesecake",
        "price": "CA$50",
        "media": "https://scontent.fyto1-1.fna.fbcdn.net/v/t45.5328-4/505710277_3082163808625285_5490962247118905515_n.jpg?stp=c0.43.261.261a_dst-jpg_p261x260_tt6&_nc_cat=1&ccb=1-7&_nc_sid=247b10&_nc_ohc=dlb7Q3rYbjUQ7kNvwF54TFC&_nc_oc=AdlfwPxBnbMwo0JV7THqYUCprDUe7qIojxwFBaBZV0xI6mNaPSRahNJ0rbxoe3CWIok&_nc_zt=23&_nc_ht=scontent.fyto1-1.fna&_nc_gid=3EqIVUjk50apz9phJskyQA&oh=00_AfMFlhVn7J2nw_av6-OP5wi1c9KY9PeiDJe_Q61O9guFrA&oe=685D010C",
        "url": "www.facebook.com/marketplace/item/708200282143423/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD"
    }
  ]

  const loadProducts = () => {
    fetch('http://localhost:8080/scrape/parsepage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
        body: JSON.stringify({ 
          html: document.documentElement.outerHTML,
          baseUrl: window.location.host,
        })
      })
        .then(response => response.json())
        .then(data => {
        console.log('Swipify - /scrape/parsepage response:', data);
          
        const products = data.products
        loadCards(products)
      })
      .catch(error => {
        console.error('Swipify - Error posting to /scrape/parsepage:', error);
      });
  }

  setTimeout(() => {
    loadProducts()
  }, 1000)
  // loadCards(test)
});


// const liked_products = {
//   'www.amazon.com': [
//     {
//       'product_name': 'Big',
//       'price': '$95',
//       'url': 'https://www.amazon.com/dp/B0B4Z5F9X3',
//       'media_url': 'https://m.media-amazon.com/images/I/61b1e2d4ZlL._AC_SL1500_.jpg',
//     },
//     // ...
//   ],
//   // ...
// }