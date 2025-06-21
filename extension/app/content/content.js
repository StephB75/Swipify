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
    



    function findRepeatedElements() {
      const allElements = [...document.querySelectorAll('body *')];
      const classCounts = {};

      for (const el of allElements) {
        const className = el.className?.toString().trim();
        if (className && typeof className === 'string') {
          classCounts[className] = (classCounts[className] || 0) + 1;
        }
      }

      // Find classes that repeat 5+ times (likely product cards)
      const candidates = Object.entries(classCounts)
        .filter(([cls, count]) => count > 5 && cls.length < 100)
        .map(([cls]) => cls);

      return candidates;
    }
});
