const main = async () => {
    const button = document.querySelector('.scrape');
    button.addEventListener('click', async () => {
        console.log('Button clicked');
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "test" });
        });
    })
    const swipify = document.querySelector('.swipify');
    swipify.addEventListener('click', async () => {
        console.log('Button clicked');
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "swipify" });
        });
    })
}

main()