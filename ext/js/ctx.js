export function mobile() {
    let check = false;
    (function (a) {if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;})(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}
export const mob = mobile()
const cp = (text) => {
    return
}
const searchUrbanDict = function (/** @type {any} */ word) {
    const query = word;
    cp(word);
    chrome.tabs.create({url: 'http://www.urbandictionary.com/define.php?term=' + query});
};
const search = function (/** @type {any} */ word) {
    const query = word;
    cp(word);
    // copyTextToClipboard(query)
    // document.execCommand('copy')
};
const searchJ = function (/** @type {any} */ word) {
    const query = word;
    cp(word);
    const prp = {url: 'http://www.jisho.org/search/' + query};
    chrome.tabs.create(prp);
};
const searchW = function (/** @type {any} */ word) {
    const query = word;
    cp(word);
    // console.log(999999999999999)
    chrome.tabs.create({url: 'https://en.wiktionary.org/w/index.php?go=Go&search=' + query});
    // chrome.tabs.create({ url: "https://en.wiktionary.org/w/index.php?go=Go&search=" + query });
};
const searchKD = function (/** @type {any} */ word) {
    const query = word;
    cp(word);
    chrome.tabs.create({url: 'https://www.kanjidamage.com/kanji/search?q=' + query});
};
const searchJP = function (/** @type {any} */ word) {
    const query = word;
    cp(word);
    chrome.tabs.create({url: 'https://www.kanjipedia.jp/search?kt=1&sk=leftHand&k=' + query});
};
const searchM = function (/** @type {any} */ word) {
    const query = word;
    cp(word);
    chrome.tabs.create({url: 'https://ichi.moe/cl/qr/?r=htr&q=' + query});
};
const searchY = function (/** @type {any} */ word) {
    const query = word;
    cp(word);
    chrome.tabs.create({url: 'https://www.youtube.com/results?search_query=' + query});
};
const searchDL = function (/** @type {any} */ word) {
    const query = word;
    cp(word);
    chrome.tabs.create({url: 'https://www.deepl.com/translator#ja/en/' + query});
};
const searchG = function (/** @type {any} */ word) {
    const query = word;
    cp(word);
    chrome.tabs.create({url: 'https://github.com/search?type=repositories&q=' + query});
};
const searchR = function (/** @type {any} */ word) {
    const query = word;
    cp(word);
    chrome.tabs.create({url: 'https://old.reddit.com/search?q=' + query});
};
const searchT = function (/** @type {any} */ word) {
    const query = word;
    cp(word);
    chrome.tabs.create({url: 'https://twitter.com/search?src=typed_query&q=' + query});
};
const searchWw = function (/** @type {any} */ word) {
    const query = word;
    cp(word);
    chrome.tabs.create({url: 'https://en.wikipedia.org/wiki/Special:Search?go=Go&search=' + query});
};
const searchYu = function (/** @type {any} */ word) {
    const query = word;
    cp(word);
    chrome.tabs.create({url: 'https://gogen-yurai.jp/?s=' + query});
};
function sendM3U(info, tab) {
    chrome.tabs.query({currentWindow: true, active: true}).then((tabs) => {
        if (tabs.length !== 0) {
            var url = tabs[0].url;
            if (info) {
                url = info.linkUrl || info.srcUrl;
            }
            console.log("play-url: sending " + url);
            var content = "#EXTM3U\n" + url;
            var blob = new Blob([content], {type: 'video/x-mpegurl;charset=utf-8'});
            // Pass the blob data as a query parameter
            var extensionUrl = chrome.runtime.getURL("");
            var blobUrl = extensionUrl + "?blob=" + encodeURIComponent(blob);

            chrome.tabs.update(tabs[0].id, {url: blobUrl});
        }
    });
}
const tb = true;
const tbs = 0;
const ctx = function (/** @type {{ selectionText: any; menuItemId: string; }} */ info, /** @type {any} */ tab) {
    // console.dir(info)
    // event//.preventDefault()
    if (tab) {
        chrome.contextMenus.onClicked.removeListener(ctx);
        const sl = info.selectionText;
        const n = parseInt(info.menuItemId.substring(4));
        // tbs += 1
        // let tb = true
        console.log(`Item ${n} ${tbs} ${sl} ${info.menuItemId} clicked in tab ${this}`);
        if (sl) {
            // info.stopImmediatePropagation();
            switch (n) {
                case 0:
                    searchWw(sl);
                    break;
                case 1:
                    search(sl);
                    break;
                case 2:
                    searchJ(sl);
                    // console.log(j)
                    break;
                case 3:
                    searchW(sl);
                    break;
                case 4:
                    searchKD(sl);
                    break;
                case 5:
                    searchM(sl);
                    break;
                case 6:
                    searchJP(sl);
                    break;
                case 8:
                    searchY(sl);
                    break;
                case 9:
                    searchDL(sl);
                    break;
                case 10:
                    searchG(sl);
                    break;
                case 11:
                    searchR(sl);
                    break;
                case 12:
                    searchT(sl);
                    break;
                case 13:
                    searchYu(sl);
                    break;
                case 7:
                    searchUrbanDict(sl);
                    break;
                case 20:
                    sendM3U(info, tab);
                    break;
                default:
                    searchY(sl);
                    break;
            }
        }
    }
};
export function context() {
    try {
        console.warn('ctx');
        //return
        if (!mob && chrome?.contextMenus) {
            try {
                chrome.contextMenus.removeAll();
            } catch { }
            chrome.contextMenus.create({
                id: 'yomu001',
                title: 'Search',
                contexts: ['selection'] // ContextType
            });
            // sr.onClicked.addListener(search);
            chrome.contextMenus.create({
                id: 'yomu002',
                title: 'Search in Jisho',
                contexts: ['selection'] // ContextType
            });
            // sj.onClicked.addListener(searchJ);
            chrome.contextMenus.create({
                id: 'yomu003',
                title: 'Search in Wiktionary',
                contexts: ['selection'] // ContextType
            });
            // chrome.contextMenus.onClicked.addListener(searchW);
            chrome.contextMenus.create({
                id: 'yomu004',
                title: 'Search in KanjiDamage',
                contexts: ['selection'] // ContextType
            });
            // chrome.contextMenus.onClicked.addListener(searchKD);
            chrome.contextMenus.create({
                id: 'yomu005',
                title: 'Search in Moe',
                contexts: ['selection'] // ContextType
            });
            // chrome.contextMenus.onClicked.addListener(searchM);
            chrome.contextMenus.create({
                id: 'yomu006',
                title: 'Search in Kanjipedia (JP)',
                contexts: ['selection'] // ContextType
            });
            // chrome.contextMenus.onClicked.addListener(searchJP);
            chrome.contextMenus.create({
                id: 'yomu007',
                title: 'Search in UrbanDictionary',
                contexts: ['selection'] // ContextType
            });
            chrome.contextMenus.create({
                id: 'yomu008',
                title: 'Search in YouTube',
                contexts: ['selection'] // ContextType
            });
            chrome.contextMenus.create({
                id: 'yomu009',
                title: 'Translate in DeepL',
                contexts: ['selection'] // ContextType
            });
            chrome.contextMenus.create({
                id: 'yomu010',
                title: 'Search in Github',
                contexts: ['selection'] // ContextType
            });
            chrome.contextMenus.create({
                id: 'yomu011',
                title: 'Search in Reddit',
                contexts: ['selection'] // ContextType
            });
            chrome.contextMenus.create({
                id: 'yomu012',
                title: 'Search in Twitter',
                contexts: ['selection'] // ContextType
            });
            chrome.contextMenus.create({
                id: 'yomu013',
                title: 'Search in Yurei (JP)',
                contexts: ['selection'] // ContextType
            });
            chrome.contextMenus.create({
                id: 'yomu000',
                title: 'Search in Wikipedia',
                contexts: ['selection'] // ContextType
            });
            chrome.contextMenus.create({
                id: "yomu020",
                title: "Play URL",
                contexts: ["link", "image", "video"]
            });

            chrome.contextMenus.onClicked.addListener(ctx.bind(this));
        }
    } catch (error) {
        console.error(error);
    }
}
/* function convertSecondsToSrtFormat(seconds) {
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
// return f
/*    } catch (err) {
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
                        "accept": "application/json, text/plain, *
/*                        "accept-language": "ja,en;q=0.9,en-US;q=0.8",
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
})*/
