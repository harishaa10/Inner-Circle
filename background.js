chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    IsBlockedSite(tab);
})

function IsBlockedSite(tab) {
    hostname = new URL(tab.url).hostname;
    chrome.storage.local.get(["BlockedUrl"], (data) => {
        if (data.BlockedUrl !== undefined) {
            if (data.BlockedUrl.includes(hostname)) {
                console.log("Dangerous tab. Close it for inner peace");
                //chrome.tabs.discard(tab.id);
                //chrome.tabs.remove(tab.id, ()=>chrome.runtime.lastError)
                ReDirectPage(tab);
            }
        }
    })
}

function ReDirectPage(tab) {
    chrome.tabs.update(tab.id, {
        url: chrome.runtime.getURL("./pages/areyoulost.html")});
}

