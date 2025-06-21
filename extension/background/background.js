// background.js
import { updateScrapedData, datasetNameExists, getRemainingScrapes } from "./functions.js";

chrome.runtime.onInstalled.addListener(() => {
    console.log('background.js loaded')
})

// const system = new System()
// const initCredentials = async () => {
//     const userCredentials = (await chrome.storage.local.get('Nodes_userCredentials')).Nodes_userCredentials
//     // console.log(userCredentials)
//     if(userCredentials) {
//         const keys = Object.keys(userCredentials)
//         if(keys.length === 0) return

//         userCredentials.membershipInfo = await getRemainingScrapes(userCredentials.uid)
//         await chrome.storage.local.set({'Nodes_membershipInfo': userCredentials.membershipInfo})
        
//         // console.log('User is logged in')
//         console.log(userCredentials)
//         await system.init(userCredentials)

//         // console.log(system.userData)
//     }
// }

// initCredentials()


chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    await chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
        
        const sendResponse = async (tabId, request) => {
            await chrome.tabs.sendMessage(tabId, request)
        }
        
        console.log('tabId', sender.tab.id)
        
        const sender_id = sender.tab.id
        const action = request.action
        
        switch(action){

            case 'refresh':
                await sendResponse(sender_id, {action}) 
                break;

            case 'test':
                console.log('test', request)
                // console.log(current_scrape)
                break;
        }
        
        // console.log(request)
        
    })
    }

);
