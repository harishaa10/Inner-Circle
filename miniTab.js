var tabUrl, tabHostName;

//Appearance when the extension is clicked
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    tabUrl = tabs[0].url;
    tabHostName = new URL(tabs[0].url).hostname;
    document.getElementById("url").innerText = tabHostName;
})

// Block button
document.getElementById("blockBtn").addEventListener("click", () => {

    chrome.storage.local.get("BlockedUrl", (results) => {
        if (results.BlockedUrl === undefined) {
            const temp = [tabHostName];
            chrome.storage.local.set({
                BlockedUrl: temp
            });
        } else if (!results.BlockedUrl.includes(tabHostName)){
            const temp= results.BlockedUrl;
            chrome.storage.local.set({
                BlockedUrl: temp.concat(tabHostName)
            }
            );
        }
        console.log(results);
    })
})

// Unblock button
document.getElementById("unblockBtn").addEventListener("click", () => {
    chrome.storage.local.get(["BlockedUrl"], (results) => {
        var temp = results.BlockedUrl;
        if (Array.isArray(temp)) {
            var index = temp.indexOf(tabHostName);
            if (index > -1) {
                temp.splice(index, 1);
                chrome.storage.local.set({
                    BlockedUrl: temp
                });
            }
        }
    })
})