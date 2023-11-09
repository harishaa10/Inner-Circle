//E1: When tabs are changed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    IsBlockedSite(tab);
})

//F1: check for time, if it falls between the from and to time then block the site
function CheckTime() {
    return new Promise((resolve, reject) => {
        var d = new Date();
        var hr = d.getHours();
        var min = d.getMinutes();

        chrome.storage.local.get(["fromTime", "toTime", "toggleCheck"], (data) => {
            if (data.toggleCheck == false) {
                resolve(false);
            }
            if (data.fromTime !== undefined && data.toTime !== undefined) {
                var fromTime = data.fromTime.split(":");
                var toTime = data.toTime.split(":");
                console.log(fromTime, toTime);
                console.log(hr, min);
                if (hr >= fromTime[0] && hr <= toTime[0]) {
                    if (hr == fromTime[0] && min < fromTime[1]) {
                        resolve(false);
                    }
                    if (hr == toTime[0] && min > toTime[1]) {
                        resolve(false);
                    }
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        });
    });
}

//F2: Check if the site is blocked
function IsBlockedSite(tab) {
    hostname = new URL(tab.url).hostname;
    chrome.storage.local.get(["BlockedUrl"], (data) => {
        if (data.BlockedUrl !== undefined) {
            if (data.BlockedUrl.includes(hostname)) {
                CheckTime().then((isTimeValid) => {
                    if (isTimeValid) {
                        ReDirectPage(tab);
                    }
                });
            }
        }
    });
}


//F3: Redirect to the areyoulost page
function ReDirectPage(tab) {
    chrome.tabs.update(tab.id, {
        url: chrome.runtime.getURL("./pages/areyoulost.html")});
}


