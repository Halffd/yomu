function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function () {
        console.log('Async: Copying to clipboard was successful!');
    }, function (err) {
        console.error('Async: Could not copy text: ', err);
    });
}
var cp = function (text) {
    const parent = document.body;
    if (parent === null) { return; }

    let textarea = null;
    if (textarea === null) {
        textarea = document.createElement('textarea');
        this._copyTextarea = textarea;
    }

    textarea.value = text;
    parent.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    parent.removeChild(textarea);
}
let searchUrbanDict = function (word) {
    var query = word;
    cp(word)
    chrome.tabs.create({ url: "http://www.urbandictionary.com/define.php?term=" + query });
};
let search = function (word) {
    var query = word;
    cp(word)
    //copyTextToClipboard(query)
    //document.execCommand('copy')
};
let searchJ = function (word) {
    var query = word;
    cp(word)
    let prp = { url: "http://www.jisho.org/search/" + query }
    chrome.tabs.create(prp)
};
let searchW = function (word) {
    var query = word;
    cp(word)
    //console.log(999999999999999)
    chrome.tabs.create({ url: "https://en.wiktionary.org/w/index.php?go=Go&search=" + query });
    //chrome.tabs.create({ url: "https://en.wiktionary.org/w/index.php?go=Go&search=" + query });
};
let searchKD = function (word) {
    var query = word;
    cp(word)
    chrome.tabs.create({ url: "https://www.kanjidamage.com/kanji/search?q=" + query });
};
let searchJP = function (word) {
    var query = word;
    cp(word)
    chrome.tabs.create({ url: "https://www.kanjipedia.jp/search?kt=1&sk=leftHand&k=" + query });
};
let searchM = function (word) {
    var query = word;
    cp(word)
    chrome.tabs.create({ url: "https://ichi.moe/cl/qr/?r=htr&q=" + query });
};
let searchY = function (word) {
    var query = word;
    cp(word)
    chrome.tabs.create({ url: "https://www.youtube.com/results?search_query=" + query });
};
let searchDL = function (word) {
    var query = word;
    cp(word)
    chrome.tabs.create({ url: "https://www.deepl.com/translator#ja/en/" + query });
};
let searchG = function (word) {
    var query = word;
    cp(word)
    chrome.tabs.create({ url: "https://github.com/search?type=repositories&q=" + query });
};
let searchR = function (word) {
    var query = word;
    cp(word)
    chrome.tabs.create({ url: "https://old.reddit.com/search?q=" + query });
};
let searchT = function (word) {
    var query = word;
    cp(word)
    chrome.tabs.create({ url: "https://twitter.com/search?src=typed_query&q=" + query });
};
let searchWw = function (word) {
    var query = word;
    cp(word)
    chrome.tabs.create({ url: "https://en.wikipedia.org/wiki/Special:Search?go=Go&search=" + query });
};
let searchYu = function (word) {
    var query = word;
    cp(word)
    chrome.tabs.create({ url: "https://gogen-yurai.jp/?s=" + query });
};
console.dir(chrome)
try {
    chrome.contextMenus.removeAll()
} catch { }
chrome.contextMenus.create({
    id: 'yomu001',
    title: "Search",
    contexts: ["selection"]  // ContextType
});
//sr.onClicked.addListener(search);
chrome.contextMenus.create({
    id: 'yomu002',
    title: "Search in Jisho",
    contexts: ["selection"]  // ContextType
});
//sj.onClicked.addListener(searchJ);
chrome.contextMenus.create({
    id: 'yomu003',
    title: "Search in Wiktionary",
    contexts: ["selection"]  // ContextType
});
//chrome.contextMenus.onClicked.addListener(searchW);
chrome.contextMenus.create({
    id: 'yomu004',
    title: "Search in KanjiDamage",
    contexts: ["selection"]  // ContextType
});
//chrome.contextMenus.onClicked.addListener(searchKD);
chrome.contextMenus.create({
    id: 'yomu005',
    title: "Search in Moe",
    contexts: ["selection"]  // ContextType
});
//chrome.contextMenus.onClicked.addListener(searchM);
chrome.contextMenus.create({
    id: 'yomu006',
    title: "Search in Kanjipedia (JP)",
    contexts: ["selection"]  // ContextType
});
//chrome.contextMenus.onClicked.addListener(searchJP);
chrome.contextMenus.create({
    id: 'yomu007',
    title: "Search in UrbanDictionary",
    contexts: ["selection"]  // ContextType
});
chrome.contextMenus.create({
    id: 'yomu008',
    title: "Search in YouTube",
    contexts: ["selection"]  // ContextType
});
chrome.contextMenus.create({
    id: 'yomu009',
    title: "Translate in DeepL",
    contexts: ["selection"]  // ContextType
});
chrome.contextMenus.create({
    id: 'yomu010',
    title: "Search in Github",
    contexts: ["selection"]  // ContextType
});
chrome.contextMenus.create({
    id: 'yomu011',
    title: "Search in Reddit",
    contexts: ["selection"]  // ContextType
});
chrome.contextMenus.create({
    id: 'yomu012',
    title: "Search in Twitter",
    contexts: ["selection"]  // ContextType
});
chrome.contextMenus.create({
    id: 'yomu013',
    title: "Search in Yurei (JP)",
    contexts: ["selection"]  // ContextType
});
chrome.contextMenus.create({
    id: 'yomu000',
    title: "Search in Wikipedia",
    contexts: ["selection"]  // ContextType
});
var tb = true
var tbs = 0
var ctx = function (info, tab) {
    //console.dir(info)
    //event//.preventDefault()
    if (tab) {
        chrome.contextMenus.onClicked.removeListener(ctx)
        let sl = info.selectionText
        let n = parseInt(info.menuItemId.substring(4))
        //tbs += 1
        //let tb = true
        console.log(`Item ${n} ${tbs} ${sl} ${info.menuItemId} clicked in tab ${this}`);
        if (true) {
            //info.stopImmediatePropagation();
            switch (n) {
                case 0:
                    searchWw(sl)
                    break;
                case 1:
                    search(sl)
                    break;
                case 2:
                    searchJ(sl)
                    //console.log(j)
                    break;
                case 3:
                    searchW(sl)
                    break;
                case 4:
                    searchKD(sl)
                    break;
                case 5:
                    searchM(sl)
                    break;
                case 6:
                    searchJP(sl)
                    break;
                case 8:
                    searchY(sl)
                    break;
                case 9:
                    searchDL(sl)
                    break;
                case 10:
                    searchG(sl)
                    break;
                case 11:
                    searchR(sl)
                    break;
                case 12:
                    searchT(sl)
                    break;
                case 13:
                    searchYu(sl)
                    break;
                case 7:
                    searchUrbanDict(sl)
                    break;
                default:
                    searchY(sl)
                    break;
            }
        }
    }
}
chrome.contextMenus.onClicked.addListener(ctx.bind(this));

function convertSecondsToSrtFormat(seconds) {
    const date = new Date(seconds * 1000);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    seconds = date.getUTCSeconds().toString().padStart(2, '0');
    const milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0');
  
    return `${hours}:${minutes}:${seconds},${milliseconds}`;
  }
function convertToSrt(data) {
    let srtContent = '';

    data.forEach((obj, index) => {
        const startTime = parseInt(obj.video_offset);
        const endTime = index < data.length - 1 ? parseInt(data[index + 1].video_offset) : startTime + 15; 
        console.warn(startTime,endTime);
        const formattedStartTime = convertSecondsToSrtFormat(startTime);
        const formattedEndTime = convertSecondsToSrtFormat(endTime);
        const message = obj.message;

        srtContent += `${index + 1}\n${formattedStartTime} --> ${formattedEndTime}\n${message}\n\n`;
    });

    return srtContent;
}
function downloadSrtFile(srtContent, filename) {
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
var dt = null
let get = async() => {
    let url = document.URL
    if (url.includes('holodex.net/watch')) {
        var segments = url.split("/");
        var lastSegment = segments[segments.length - 1];
        let dest = ''
        var requestDetails = {
            method: 'GET',
            url: `https://holodex.net/api/v2/videos/${lastSegment}/chats?lang=en&verified=true&moderator=true&vtuber=true&limit=100000`,
        };
        console.log(lastSegment, requestDetails);
        try {
            let response = await fetch(requestDetails.url, {
                method: 'GET'
            })
            let j = await response.json();
            return j
            /*.then(response => {
                if (response.ok) {
                    // The request was successful (status code 200-299)
                    return response.json();
                } else {
                    // The request was not successful
                    throw new Error('Request failed with status code ' + response.status);
                }
            })
                .then(data => {
                    // Handle the response data
                    console.log(data);
                    dt = data
                })
                .catch(error => {
                    // Handle any errors that occurred during the request
                    console.error(error);
                });*/
            //return f
        } catch (err) {
            console.error(err);
        }
    }
}
get().then(o => {
    console.warn(o);
    let sub = convertToSrt(o)
    console.log(sub);
    let tit = document.title
    downloadSrtFile(sub,`${tit}.srt`)
    //copy(sub)
})
chrome.tabs.onActivated.addListener((activeInfo) => {
    try {
        chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true, 'currentWindow': true }, function (tabs) {
            // since only one tab should be active and in the current window at once
            // the return variable should only have one entry
            //var activeTabId = activeTab.id; // or do whatever you need
            var currentTab = tabs[0];
            console.dir(currentTab)
            if (currentTab) {
                var siteUrl = currentTab.url;
                console.log(siteUrl);
                url = siteUrl
                if (url.includes('holodex.net/watch')) {
                    var segments = url.split("/");
                    var lastSegment = segments[segments.length - 1];
                    let dest = ''
                    var requestDetails = {
                        method: 'GET',
                        url: `https://holodex.net/api/v2/videos/${lastSegment}/chats?lang=en&verified=true&moderator=true&vtuber=true&limit=100000`,
                    };
                    console.log(lastSegment, requestDetails);
                    fetch(`https://holodex.net/api/v2/videos/${lastSegment}/chats?lang=en&verified=true&moderator=true&vtuber=true&limit=20`, {
                        "headers": {
                            "accept": "application/json, text/plain, */*",
                            "accept-language": "ja,en;q=0.9,en-US;q=0.8",
                            "if-none-match": "W/\"1073-AD4NjCFOaKm1/OSnkiuygFXNRuc\"",
                            "sec-ch-ua": "\"Chromium\";v=\"118\", \"Google Chrome\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
                            "sec-ch-ua-mobile": "?0",
                            "sec-ch-ua-platform": "\"Windows\"",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin"
                        },
                        "referrer": url,
                        "referrerPolicy": "strict-origin-when-cross-origin",
                        "body": null,
                        "method": "GET",
                        "mode": "cors",
                        "credentials": "omit"
                    }).then(response => {
                        if (response.ok) {
                            // The request was successful (status code 200-299)
                            return response.json();
                        } else {
                            // The request was not successful
                            throw new Error('Request failed with status code ' + response.status);
                        }
                    })
                        .then(data => {
                            // Handle the response data
                            console.log(data);
                        })
                        .catch(error => {
                            // Handle any errors that occurred during the request
                            console.error(error);
                        });
                }
            }
        })
    } catch (err) {
        console.error(err);
    }
})