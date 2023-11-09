//ALl necessary variables
var tabUrl, tabHostName;
const hostNameToBeBlocked = document.getElementById("hostNameToBeBlocked");
const addBtn = document.getElementById("addBtn");
const blockedWebsiteList = document.getElementById("blockedWebsiteList");
const hourFrom = document.getElementById("hourFrom");
const hourTo = document.getElementById("hourTo");
const minFrom = document.getElementById("minFrom");
const minTo = document.getElementById("minTo");
const toggleCheck = document.getElementById("check-5");
const changePwd = document.getElementById("changePwd");
// const lockDown = document.getElementById("lockDown");
const unlock  = document.getElementById("unlock");

//clean everything
//chrome.storage.local.clear();

//Appearance when the extension is clicked
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    tabUrl = tabs[0].url;
    tabHostName = new URL(tabs[0].url).hostname;
    displayBlockedSites();
})

//functions from here
//f1: addBlockedSite
function addBlockedSite(hostname) {
    
    if (hostname === "") {
        return;
    }

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

//f4: set fromTime and toTime
function setTime() {
    chrome.storage.local.set({
        fromTime: hourFrom.value + ":" + minFrom.value
    });
    chrome.storage.local.set({
        toTime: hourTo.value + ":" + minTo.value
    }); 
    chrome.storage.local.set({
        toggleCheck: true
    });
}

//f5: get fromTime and toTime
function getTime() {
    chrome.storage.local.get(["fromTime"], (results) => {
        if (results.fromTime !== undefined) {
            const temp = results.fromTime.split(":");
            hourFrom.value = temp[0];
            minFrom.value = temp[1];
        }else{
            hourFrom.value= "00";
            minFrom.value= "00";
        }
    });
    chrome.storage.local.get(["toTime"], (results) => {
        if (results.toTime !== undefined) {
            const temp = results.toTime.split(":");
            hourTo.value = temp[0];
            minTo.value = temp[1];
        } else {
            hourTo.value = "00";
            minTo.value = "00";
        }
    });
    chrome.storage.local.get(["toggleCheck"], (results) => {
        if (results.toggleCheck !== undefined) {
            toggleCheck.checked = results.toggleCheck;
        } 
    });
}

//f6: toggle the state of the checkbox
function toggleState() {
    if (!toggleCheck.checked) {
        chrome.storage.local.set({
            toggleCheck: false
        });
    } else {
        chrome.storage.local.set({
            toggleCheck: true
        });
    }
}

//f7: On time input, change the toggle state
function onTimeInputChange() {
    toggleCheck.checked = false;
    toggleState();
}

//f8: change password
function changePassword() {
    var userInput = prompt("Enter the current password");

    chrome.storage.local.get({"passwordInnerPeace": "iamfightingmyinnerdemons"}, (results) => {
        var correctPassword = results.passwordInnerPeace === userInput;

        if (correctPassword) {
            var newPassword = prompt("Enter the new password");

            if (newPassword !== null && newPassword !== "") {
                chrome.storage.local.set({
                    passwordInnerPeace: newPassword
                });

                alert("Password changed successfully");
            } else {
                alert("Password change cancelled");
            }
        } else {
            alert("Wrong Password");
        }
    });
}

// f9: check for time, if it falls between the from and to time then block the site
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

//f10: lockdownButtons
function lockDownButtons(){
    if (CheckTime().then((isTimeValid) => {
        if (isTimeValid) {
            hourFrom.disabled = true;
            hourTo.disabled = true;
            minFrom.disabled = true;
            minTo.disabled = true;
            toggleCheck.disabled = true;
            blockedWebsiteList.disabled = true;
            changePwd.hidden = true;
            // lockDown.hidden = true;
            unlock.hidden = false;
        } else {
            hourFrom.disabled = false;
            hourTo.disabled = false;
            minFrom.disabled = false;
            minTo.disabled = false;
            toggleCheck.disabled = false;
            blockedWebsiteList.disabled = false;
            changePwd.disabled = false;
            unlock.hidden = true;
            // lockDown.hidden = false;
            changePwd.hidden = false;
        }
    }));
}

//f11: unlockDownButtons
function unlockDown() {
    var userInput = prompt("Enter the password");
    chrome.storage.local.get(["passwordInnerPeace"], (results) => {
        var correctPassword = results.passwordInnerPeace === userInput;
        if (correctPassword) {
            toggleCheck.checked = false;
            toggleState();
            lockDownButtons();
        } else {
            alert("Wrong Password");
        }
    });    
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

// //E3: Unblock button
// document.getElementById("unblockBtn").addEventListener("click", () => {
//     deleteBlockedSite(tabHostName);
// })

//E4: Remove blocked site using X
blockedWebsiteList.addEventListener("click", (e) => {
    if (!blockedWebsiteList.disabled && e.target.tagName === "SPAN") {
        //alert(e.target.parentElement.textContent.slice(0, -1));
        deleteBlockedSite(e.target.parentElement.childNodes[0].data);   
    }
}, false);

//E5: Add blocked site using Enter
hostNameToBeBlocked.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        addBlockedSite(hostNameToBeBlocked.value);
    }
})

//E6: Set Time if checkbox is checked
toggleCheck.addEventListener("click", () => {
    if (toggleCheck.checked) {
        setTime();
    }
})

//E7: change toggle State of unchecked
toggleCheck.addEventListener("click", () => {
    toggleState();
    lockDownButtons();
})

//E8: if time is being edited, then toggle the switch to unchecked
hourFrom.addEventListener("keyup", onTimeInputChange);
minFrom.addEventListener("keyup", onTimeInputChange);
hourTo.addEventListener("keyup", onTimeInputChange);
minTo.addEventListener("keyup", onTimeInputChange);

//E9: Change password
changePwd.addEventListener("click", () => {
    changePassword();
})

//E10: unlock
unlock.addEventListener("click", () => {
    unlockDown();
})


//Default functions
//D1: get Time automatically
getTime();

//D2: Lockdownbuttons if time is valid
lockDownButtons();