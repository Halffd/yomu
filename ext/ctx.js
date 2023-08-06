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
    navigator.clipboard.writeText(text).then(function() {
      console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
  }
  
let searchUrbanDict = function (word) {
    var query = word;
    chrome.tabs.create({ url: "http://www.urbandictionary.com/define.php?term=" + query });
};
let search = function (word) {
    var query = word;
    copyTextToClipboard(query)
    document.execCommand('copy')
};
let searchJ = function (word) {
    var query = word;
    let prp = { url: "http://www.jisho.org/search/" + query }
    chrome.tabs.create(prp)
};
let searchW = function (word) {
    var query = word;
    //console.log(999999999999999)
    chrome.tabs.create({ url: "https://en.wiktionary.org/w/index.php?go=Go&search="  + query });
    //chrome.tabs.create({ url: "https://en.wiktionary.org/w/index.php?go=Go&search=" + query });
};
let searchKD = function (word) {
    var query = word;
    chrome.tabs.create({ url: "https://www.kanjidamage.com/kanji/search?q=" + query });
};
let searchJP = function (word) {
    var query = word;
    chrome.tabs.create({ url: "https://www.kanjipedia.jp/search?kt=1&sk=leftHand&k=" + query });
};
let searchM = function (word) {
    var query = word;
    chrome.tabs.create({ url: "https://ichi.moe/cl/qr/?r=htr&q=" + query });
};
let searchY = function (word) {
    var query = word;
    chrome.tabs.create({ url: "https://www.youtube.com/results?search_query=" + query });
};
let searchDL = function (word) {
    var query = word;
    chrome.tabs.create({ url: "https://www.deepl.com/translator#ja/en/" + query });
};
let searchG = function (word) {
    var query = word;
    chrome.tabs.create({ url: "https://github.com/search?type=repositories&q=" + query });
};
let searchR = function (word) {
    var query = word;
    chrome.tabs.create({ url: "https://old.reddit.com/search?q=" + query });
};
let searchT = function (word) {
    var query = word;
    chrome.tabs.create({ url: "https://twitter.com/search?src=typed_query&q=" + query });
};
let searchWw = function (word) {
    var query = word;
    chrome.tabs.create({ url: "https://en.wikipedia.org/wiki/Special:Search?go=Go&search=" + query });
};
let searchYu = function (word) {
    var query = word;
    chrome.tabs.create({ url: "https://gogen-yurai.jp/?s=" + query });
};
console.dir(chrome)
chrome.contextMenus.removeAll()
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
