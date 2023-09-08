//ALl necessary variables
var tabUrl, tabHostName;
const hostNameToBeBlocked = document.getElementById("hostNameToBeBlocked");
const addBtn = document.getElementById("addBtn");
const blockedWebsiteList = document.getElementById("blockedWebsiteList");


//Appearance when the extension is clicked
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    tabUrl = tabs[0].url;
    tabHostName = new URL(tabs[0].url).hostname;
    displayBlockedSites();
})

//funcations from here
//f1: addBlockedSite
function addBlockedSite(hostname) {
    chrome.storage.local.get(["BlockedUrl"], (results) => {
        if (results.BlockedUrl === undefined) {
            const temp = [hostname];
            chrome.storage.local.set({
                BlockedUrl: temp
            });    
        } else if (!results.BlockedUrl.includes(hostname)){
            const temp= results.BlockedUrl;
            chrome.storage.local.set({
                BlockedUrl: temp.concat(hostname)
            });
            hostNameToBeBlocked.value= "";
        }
        displayBlockedSites();
        
    })
}

//f2: displayBlockedSites
function displayBlockedSites() {
    document.getElementById("blockedWebsiteList").innerHTML = "";
    chrome.storage.local.get(["BlockedUrl"], (results) => {
        if (results.BlockedUrl !== undefined) {
            results.BlockedUrl.forEach((element) => {
                let li = document.createElement("li");
                li.textContent = element;
                blockedWebsiteList.appendChild(li);
                let span= document.createElement("span");
                span.innerHTML= "\u00D7";
                li.appendChild(span);
            })
        }
    })
}

//f3: deleteBlockedSite
function deleteBlockedSite(hostname) {
    chrome.storage.local.get(["BlockedUrl"], (results) => {
        if (results.BlockedUrl !== undefined) {
            var temp = results.BlockedUrl;
            var index = temp.indexOf(hostname);
            if (index > -1) {
                temp.splice(index, 1);
                chrome.storage.local.set({
                    BlockedUrl: temp
                });
            }
            displayBlockedSites();
        }
    })
}

//All event listeners from here
// E1: Block This Site button
document.getElementById("blockBtn").addEventListener("click", () => {
    addBlockedSite(tabHostName);
});

// E2: Block Input Site Button
addBtn.addEventListener("click", () => {
    addBlockedSite(hostNameToBeBlocked.value);
});

//E3: Unblock button
document.getElementById("unblockBtn").addEventListener("click", () => {
    deleteBlockedSite(tabHostName);
})

//E4: Remove blocked site using X
blockedWebsiteList.addEventListener("click", (e) => {
    if (e.target.tagName === "SPAN") {
        //alert(e.target.parentElement.textContent.slice(0, -1)); 
        deleteBlockedSite(e.target.parentElement.childNodes[0].data);   
    }
}, false);