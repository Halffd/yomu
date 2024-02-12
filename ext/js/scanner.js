let jpdb;
chrome.commands.onCommand.addListener(function(command) {
    if (command === 'scan_elements') {
        const filePath = chrome.extension.getURL('jpdb.json');
        console.warn(filePath);
        fetch(filePath)
            .then((response) => response.json())
            .then((jsonData) => {
                jpdb = jsonData;
                console.log('Jpdb ---', jsonData, jpdb);
                chrome.tabs.executeScript({
                    code: `
          console.log("aScan")
          var jpdb = JSON.parse('" + encodeToPassToContentScript(${jpdb}) + "');
          console.log(jpdb)
function frequency(word) {
    const entry = jpdb.find(entry => entry[0] === word || entry[2].reading === word);
    return entry ? entry[2]?.frequency?.value : -1;
}

function reading(word) {
    const entry = jpdb.find(entry => entry[0] === word);
    return entry ? entry[2].reading : null;
}

var elementsWithText = [];
var elements = document.querySelectorAll("*");
for (var i = 0; i < elements.length; i++) {
    try {
        var element = elements[i];
        if (element.innerText.trim().length > 0) {
            var text = element.innerText;
            var words = text.split(" ");
            var newContent = "";
            for (var j = 0; j < words.length; j++) {
                try {
                    var word = words[j];
                    var furigana = reading(word);
                    if (furigana) {
                        newContent += "<ruby>" + word + "<rt>" + furigana + "</rt></ruby> ";
                    } else {
                        continue //newContent += word + " ";
                    }
                } catch (err) {
                    console.error(err)
                }
            }
            element.innerHTML = newContent.trim();
            elementsWithText.push(element);
        }
    } catch (error) {
        console.error(error)
    }
}
console.log("Elements with text:", elementsWithText);`
                });
            })
            .catch((error) => {
                console.error('Error fetching JSON:', error);
            });
    }
});
/**
 * @param {any} obj
 */
function encodeToPassToContentScript(obj) {
    // Encodes into JSON and quotes \ characters so they will not break
    //  when re-interpreted as a string literal. Failing to do so could
    //  result in the injection of arbitrary code and/or JSON.parse() failing.
    return JSON.stringify(obj).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
// Function to perform actions when <td> elements are present
/**
 * @param {number} tabId
 * @param {number} frameId
 */
function performActions(tabId, frameId) {
    // Display the elements in a fixed popup at the bottom right corner
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '10px';
    popup.style.right = '10px';

    // Get the absolute URL of the local HTML file
    const filePath = chrome.extension.getURL('searchPopup.html');

    // Load the local HTML file into the popup
    fetch(filePath)
        .then((response) => response.text())
        .then((html) => {
            // Set the HTML content of the popup
            // Add the popup to the document body
            chrome.tabs.executeScript(tabId, {
                code: `
                const popup = document.createElement('div');
                popup.style.position = 'fixed';
                popup.style.top = '10px';
                popup.style.right = '10px';
                document.body.innerHTML = '0000
                popup.innerHTML = ${html};
                console.warn(popup);
                document.body.appendChild(${popup})
            `
            });
        })
        .catch((error) => {
            console.error('Failed to load search.html:', error);
        });
    try {
    // Load the code
        const japaneseUtil = new JapaneseUtil(wanakana);
        const display = new Display(tabId, frameId, 'search', japaneseUtil);
        const displayAudio = new DisplayAudio(display);
        displayAudio.prepare();

        const displayAnki = new DisplayAnki(display, displayAudio, japaneseUtil);
        displayAnki.prepare();
        const aD = new aDict(display, displayAudio, japaneseUtil, displayAnki, null, null, false);
    } catch (e) {
        console.error(e);
    }
}
// Function to observe for the presence of <td> elements
/**
 * @param {any} tabId
 * @param {any} frameId
 */
function observeForElements(tabId, frameId) {
    // Create a mutation observer to listen for changes in the DOM
    const observer = new MutationObserver(function(mutationsList) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                const tdElements = document.querySelectorAll('table > tbody > tr > td');
                console.warn(tdElements.length);
                if (tdElements.length > 0) {
                    // Send a message to the background script indicating the presence of <td> elements
                    chrome.runtime.sendMessage({action: 'tdElementsExist', tabId: tabId, frameId: frameId});
                    // Disconnect the observer once the elements are found
                    observer.disconnect();
                }
            }
        }
    });

    // Start observing changes in the <body> element
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
// Create a listener for the webNavigation.onDOMContentLoaded event
chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
    // Check if the URL matches the desired pattern
    console.warn(details.url, details);
    if (details.url.includes('https://killergerbah.github.io/asbplayer/')) {
        // Inject a content script to check for <td> elements
        performActions(details.tabId, details.frameId);
        chrome.tabs.executeScript(details.tabId, {
            code: `
        // Function to send a message to the background script
        function sendTdElementsMessage() {
          const tdElements = document.querySelectorAll('table > tbody > tr > td');
          console.log(tdElements.length,tdElements)
          if (tdElements.length > 1) {
            // Send a message to the background script indicating the presence of <td> elements
            chrome.runtime.sendMessage({ action: 'tdElementsExist', tabId: ${details.tabId}, frameId: ${details.frameId} });
          } else {
            // If the elements are not found, schedule the function for the next animation frame
            requestAnimationFrame(sendTdElementsMessage);
          }
        }
        
        // Call the function to start observing for <td> elements
        sendTdElementsMessage();
        `
        });
    }
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'tdElementsExist') {
        // Perform actions when <td> elements are present
        performActions(message.tabId, message.frameId);
    }
});