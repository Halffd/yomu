/* eslint-disable */

var convertToRomaji
var convertHiraganaToKatakana

/**
 * Description placeholder
 * @date 1/18/2024 - 1:57:42 AM
 *
 * @type {*}
 */
var aDict;
/**
 * Description placeholder
 * @date 1/18/2024 - 1:57:42 AM
 *
 * @type {*}
 */
var anki;
/**
 * Description placeholder
 * @date 1/18/2024 - 1:57:41 AM
 *
 * @type {*}
 */
var aNote;
/**
 * Description placeholder
 * @date 1/18/2024 - 1:57:41 AM
 *
 * @type {*}
 */
var sv;
/**
 * Description placeholder
 * @date 1/18/2024 - 1:57:41 AM
 *
 * @type {*}
 */
var jpu;
/**
 * Description placeholder
 * @date 1/18/2024 - 1:57:41 AM
 *
 * @type {{}}
 */
var canRun = function(option = 0) {
    const isSearchPage = document.URL.includes('search.html') && document.URL.includes('chrome-extension');
    const isRunFlagTrue = localStorage.getItem('run') === 'true';
    const isQpFlagTrue = localStorage.getItem('qp') === 'true';
    
    if (option === 1) {
        return isQpFlagTrue || isSearchPage || isRunFlagTrue;
    } else {
        return isSearchPage && isRunFlagTrue;
    }
    }
var mod = {}; // Initialize an empty namespace object
function calcFlex(result) {
    return Math.round(100 / (result + 1));
}
function calcMinus(percentage) {
    return Math.round(100 / percentage - 1);
}
function calculateItemsByPercentage(percentage) {
    const data = [
        {percentage: 100, items: 1},
        {percentage: 50, items: 1},
        {percentage: 25, items: 3},
        {percentage: 15, items: 6},
        {percentage: 10, items: 9},
        {percentage: 8, items: 11},
        {percentage: 1, items: 99}
    ];

    const decimal = percentage / 100; // Convert percentage to decimal

    let items;

    for (let i = 0; i < data.length; i++) {
        if (decimal >= data[i].percentage / 100) {
            items = data[i].items;
            break;
        }
    }

    return Math.ceil(items);
}

/**
 * @param {string | number} key
 * @param {unknown} value
 */
function add(key, value) {
    if (!(key in mod)) {
        // @ts-ignore
        mod[key] = value;
    } else {
        console.error(`Key "${key}" already exists in the object.`);
    }
}
/**
 * @param {import("./aDict").aDict} aD
 * @param {import("../display/display-anki").DisplayAnki} displayAnki
 * @param {import("./aNote").Note} aN
 * @param {(elem: { innerHTML: any; querySelector: (arg0: string) => string; getAttribute: (arg0: string) => string; classList: { add: (arg0: string) => void; }; parentElement: { getAttribute: (arg0: string) => any; }; querySelectorAll: (arg0: string) => any; }, cx?: number, tw?: string, tx?: string, _yc?: null, clip?: string, img?: any[], snd?: any[]) => Promise<void>} someValue
 */
function vars(aD, displayAnki, aN, someValue, funcs) {
    aDict = aD;
    anki = displayAnki;
    aNote = aN;
    sv = someValue;
    convertToRomaji = funcs.roma
    convertHiraganaToKatakana = funcs.hira //kata

    // Create a namespace object and assign variables as its properties
    mod = {
        aDict: aDict,
        anki: anki,
        aNote: aNote,
        sv: sv
    };
    console.log(mod);
}

window.mod = mod;
window.vars = vars;
window.add = add;