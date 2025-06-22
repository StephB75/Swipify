console.log("Swipify: _____content.js_____ loaded");

// const api_url = 'http://localhost:8080'
const api_url = 'https://swipify-production.up.railway.app'

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
            loadProducts().then((data)=>{
              // let products = data.products
              // if (products.length > 0) openOverLay()
              // else closeWaitOverlay()
              openOverLay()
            })
            openWaitOverLay()
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

  let liked_products = []

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
    liked_products = []
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

      if (currentCardIndex < 0){
        saveProducts()
      }
    }

  const findCurrentCard = () => {
    if (currentDeckElems.length === 0) return null;
    return currentDeckElems[currentCardIndex] || null;
  }

  const openWaitOverLay = () => {
    const waiting = document.querySelector('swipify-wait-overlay')
    waiting.classList.remove('hidden')
    const waiting_message = waiting.querySelector('h1')
    waiting_message.innerText = window.location.hostname 
    closeOverlay()
  }
  
  const closeWaitOverlay = () => {
    const waiting = document.querySelector('swipify-wait-overlay')
    waiting.classList.add('hidden')
  }

  const openOverLay = () => {
    const overlay = document.querySelector('swipify-overlay')
    overlay.classList.remove('hidden')
    closeWaitOverlay()
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
    exit.addEventListener('click', () => {
      closeOverlay()
      if (currentCardIndex > 0) saveProducts()
    });

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

    // wait overlay
    const waiting = document.createElement('swipify-wait-overlay')
    waiting.classList.add('hidden')
    const waiting_message = document.createElement('p')
    waiting_message.innerText = 'Swipifying'
    const waiting_url = document.createElement('h1')
    waiting_url.innerText = 'www.amazon.com'
    const waiting_loading = document.createElement('div')
    waiting_loading.classList.add('wait-loading')
    waiting.appendChild(waiting_message)
    waiting.appendChild(waiting_url)
    waiting.appendChild(waiting_loading)
    document.body.appendChild(waiting)
  }

  await attachElements();

  
  // update specific stuff ________________________________________________________________________________________

  const loadProducts = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${api_url}/scrape/parsepage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            html: document.documentElement.outerHTML,
            baseUrl: window.location.host,
          })
        });
        const data = await response.json();
        console.log('Swipify - /scrape/parsepage response:', data);

        const products = data.products;
        loadCards(products);
        resolve(data);
      } catch (error) {
        console.error('Swipify - Error posting to /scrape/parsepage:', error);
        reject(error);
      }
    });
  }
  
  const getLoginCredentials = () => {
    const uid = localStorage.getItem('swipify-id')
    if (uid ){
      chrome.storage.local.set({ 'swipify-id': uid }, () => {
        console.log('Swipify - uid saved to chrome local storage:', uid);
      });
    }
  }

  const saveProducts = async () => {
    console.log('Saving products')
    const uid = await new Promise((resolve) => {
      chrome.storage.local.get('swipify-id', (result) => {
      resolve(result['swipify-id']);
      });
    });
    if (!uid) return

    try {
      const response = await fetch(`${api_url}/db/savelike`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        liked_products,
        uid
      })
      });
      const data = await response.json();
      console.log('Swipify - /db/savelike response:', data);
      return data;
    } catch (error) {
      console.error('Swipify - Error posting to /db/savelike:', error);
      return null;
    }
  }
  
  getLoginCredentials()

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