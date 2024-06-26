/* globals av aDict aNote wn */
/**
 *
 * @param node
 * @param index
 */
import {av, wn} from './aDict.js';

/**
 * @param {Node} node
 * @param {number} index
 */
export function isIndexInsideElement(node, index) {
    if (!node || index < 0) {
        return false;
    }

    let count = 0;
    const walker = document.createTreeWalker(
        node,
        NodeFilter.SHOW_ELEMENT,
        null,
        false
    );

    while (walker.nextNode()) {
        if (count === index) {
            return true;
        }
        count++;
    }

    return false;
}
/**
 *
 * @param t
 * @param anki
 */
export async function aIn(t = '', anki = aDict?.cards) {
    const ws = await aNote.getter('words')
    const arr = merge(ws, await anki, -1, false);
    const r = arr?.res?.includes(t);
    wn(arr, r);
    return r;
}
/**
 *
 * @param local
 * @param jpws
 * @param rev
 * @param str
 */
export function merge(local = null, jpws = null, rev = -1, str = true) {
    if (!local) {
        local = localStorage.getItem('local') ?? '';
        local = local.split(' ');
    }
    if (!jpws) {
        jpws = localStorage.getItem('jpmns') ?? '';
        jpws = jpws.split(' ');
    }
    if (av('log')) {
        console.log(local, jpws, rev);
    }
    // Merge arrays
    const intersection = jpws.filter((/** @type {any} */ word) => local.includes(word));
    // Get the difference between local and jpws
    const localMinusJpws = local.filter((/** @type {any} */ word) => !jpws.includes(word));
    const jpwsMinusLocal = jpws.filter((/** @type {any} */ word) => !local.includes(word));
    localStorage.setItem('local', localMinusJpws.join(' '));
    localStorage.setItem('jpmn', jpwsMinusLocal.join(' '));
    localStorage.setItem('both', intersection.join(' '));
    // Remove duplicates (remove first occurrence)
    let uni;
    if (rev == 1) {
        uni = [...localMinusJpws, ...intersection, ...jpwsMinusLocal];
    } else if (rev == 0) {
        uni = jpws;
    } else {
        uni = [...jpwsMinusLocal, ...intersection, ...localMinusJpws];
    }
    const union = Array.from(new Set(uni));
    console.log([local, jpws, intersection, localMinusJpws, jpwsMinusLocal, union]);
    return str ? union.join(' ') : {res: union, j: jpwsMinusLocal, in: intersection, l: localMinusJpws};
}
/**
 * @param {string} action
 * @param version
 * @param params
 */
export function api(action, version = 6, params = {}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('error', () => reject('failed to issue request'));
        xhr.addEventListener('load', () => {
            try {
                const response = JSON.parse(xhr.responseText);
                if (Object.getOwnPropertyNames(response).length != 2) {
                    throw 'response has an unexpected number of fields';
                }
                if (!Object.prototype.hasOwnProperty.call(response, 'error')) {
                    throw 'response is missing required error field';
                }
                if (!Object.prototype.hasOwnProperty.call(response, 'result')) {
                    throw 'response is missing required result field';
                }
                if (response.error) {
                    throw response.error;
                }
                resolve(response.result);
            } catch (e) {
                reject(e);
            }
        });

        xhr.open('POST', 'http://127.0.0.1:8765');
        xhr.send(JSON.stringify({action, version, params}));
    });
}
// Example function to get note content by note ID
/**
 * @param {any} noteId
 */
export async function aId(noteId) {
    try {
        const notes = await api('notesInfo', 6, {notes: [noteId]});
        if (notes.length > 0) {
            const note = notes[0];
            const fields = note.fields;
            console.log(fields); // Process or display the note content
        } else {
            console.log('Note not found');
        }
    } catch (error) {
        console.error(error); // Handle any errors that occurred during the API call
    }
}
// Example function to retrieve notes by tag
/**
 * @param {any} tag
 */
export async function iTag(tag) {
    try {
        let notes = await api('findNotes', 6, {query: `tag:${tag}`});
        notes = aId(notes);
        console.log(notes); // Process or display the retrieved notes
        return notes;
    } catch (error) {
        console.error(error); // Handle any errors that occurred during the API call
    }
}

// Example function to retrieve notes by deck
/**
 * @param {any} deckName
 */
export async function iDeck(deckName) {
    try {
        const notes = await api('findNotes', 6, {query: `deck:"${deckName}"`});
        console.log(notes); // Process or display the retrieved notes
    } catch (error) {
        console.error(error); // Handle any errors that occurred during the API call
    }
}
// Example function to retrieve notes by deck and get note ID and information
/**
 * @param {string} deckName
 * @param sort
 */
export async function aDeck(deckName, sort = '') {
    let r = true;
    while (r) {
        try {
            const deckNotes = await api('findNotes', 6, {query: `deck:"${deckName}"`});
            const notes = await api('notesInfo', 6, {notes: deckNotes});
            const date = await api('cardsModTime', 6, {cards: deckNotes});

            const res = {
                ids: deckNotes,
                mod: date,
                dates: deckNotes.map((/** @type {string | number | Date} */ timestamp) => new Date(timestamp)),
                notes
            };

            if (sort === 'asc') {
                sortArrays(res, 'asc');
            } else if (sort === 'desc') {
                sortArrays(res, 'desc');
            }
            r = false;
            return res;
        } catch (error) {
            console.error(error);
        }
        await setTimeout(() => {}, 1400);
    }
}
/**
 * @param {string} q
 * @param sort
 */
export async function aQuery(q, sort = '') {
    let r = true;
    while (r) {
        try {
            const deckNotes = await api('findNotes', 6, {query: q});
            const notes = await api('notesInfo', 6, {notes: deckNotes});
            const date = await api('cardsModTime', 6, {cards: deckNotes});

            const res = {
                ids: deckNotes,
                mod: date,
                dates: deckNotes.map((/** @type {string | number | Date} */ timestamp) => new Date(timestamp)),
                notes
            };

            if (sort === 'asc') {
                sortArrays(res, 'asc');
            } else if (sort === 'desc') {
                sortArrays(res, 'desc');
            }
            r = false;
            return res;
        } catch (error) {
            console.error(error);
        }
        await setTimeout(() => {}, 800);
    }
}

/**
 *
 * @param sort
 */
export async function aAll(sort = '') {
    const r = true;
    while (r) {
        try {
            const tagNotes = await api('findNotes', 6, {query: ''});
            const notes = await api('notesInfo', 6, {notes: tagNotes});
            const date = await api('cardsModTime', 6, {cards: tagNotes});

            const res = {
                ids: tagNotes,
                mod: date,
                dates: tagNotes.map((/** @type {string | number | Date} */ timestamp) => new Date(timestamp)),
                notes
            };
            console.warn(res, tagNotes, notes);
            if (sort === 'asc') {
                sortArrays(res, 'asc');
            } else if (sort === 'desc') {
                sortArrays(res, 'desc');
            }
            console.warn(res);
            return res;
        } catch (error) {
            console.error(error);
        }
        await setTimeout(() => {}, 900);
    }
}
/**
 * @param {string} tag
 * @param sort
 */
export async function aTag(tag, sort = '') {
    const r = true;
    while (r) {
        try {
            const tagNotes = await api('findNotes', 6, {query: `tag:${tag}`});
            const notes = await api('notesInfo', 6, {notes: tagNotes});
            const date = await api('cardsModTime', 6, {cards: tagNotes});

            const res = {
                ids: tagNotes,
                mod: date,
                dates: tagNotes.map((/** @type {string | number | Date} */ timestamp) => new Date(timestamp)),
                notes
            };

            if (sort === 'asc') {
                sortArrays(res, 'asc');
            } else if (sort === 'desc') {
                sortArrays(res, 'desc');
            }

            return res;
        } catch (error) {
            console.error(error);
        }
        await setTimeout(() => {}, 1200);
    }
}

/**
 * @param {string} m
 * @param sort
 */
export async function aModel(m, sort = '') {
    const r = true;
    while (r) {
        try {
            const mNotes = await api('findNotes', 6, {query: `note:"${m}"`});
            const notes = await api('notesInfo', 6, {notes: mNotes});
            const date = await api('cardsModTime', 6, {cards: mNotes});

            const res = {
                ids: mNotes,
                mod: date,
                dates: mNotes.map((/** @type {string | number | Date} */ timestamp) => new Date(timestamp)),
                notes
            };

            if (sort === 'asc') {
                sortArrays(res, 'asc');
            } else if (sort === 'desc') {
                sortArrays(res, 'desc');
            }

            return res;
        } catch (error) {
            console.error(error);
        }
        await setTimeout(() => {}, 1000);
    }
    return null;
}
/**
 * @param {any[]} list
 * @param {string | any[]} property_name_list
 */
export function sort_by_property(list, property_name_list) {
    list.sort((/** @type {{ [x: string]: number; }} */ a, /** @type {{ [x: string]: number; }} */ b) => {
        for (let p = 0; p < property_name_list.length; p++) {
            const prop = property_name_list[p];
            if (a[prop] < b[prop]) {
                return -1;
            } else if (a[prop] > b[prop]) {
                return 1;
            }
        }
        return 0;
    });
}

/**
 * @param {{ [x: string]: any; ids?: any; mod?: any; dates?: any; notes?: any; }} res
 * @param {string} order
 */
export function sortArrays(res, order) {
    const properties = ['ids', 'mod', 'dates', 'notes'];

    if (order === 'asc') {
        sort_by_property(properties.map((prop) => res[prop]), properties);
    } else if (order === 'desc') {
        sort_by_property(properties.map((prop) => res[prop]), properties.reverse());
    }
}

/**
 * @param {any} notes
 */
export function getWords(notes) {
    const words = [];

    for (const note of notes) {
        const wordField = note.fields.Word;
        if (wordField && wordField.value) {
            words.push(wordField.value);
        }
    }

    return words;
}
/**
 * @param {{ notes: any; }} params
 * @param {string | number} fieldName
 */
export function getFields(params, fieldName) {
    const fieldValues = [];

    for (const note of params.notes) {
        const fieldValue = note.fields[fieldName];
        if (fieldValue && fieldValue.value) {
            fieldValues.push(fieldValue.value);
        }
    }

    return fieldValues;
}

const conjugationForms = [
    //  {  name: "plain affirmative",           forms: ["う", "く", "ぐ", "す", "つ", "む", "ぶ", "ぬ", "る", "る"]  },

    // present tense: 0-5
    {name: 'polite affirmative', forms: ['います', 'きます', 'ぎます', 'します', 'ちます', 'みます', 'びます', 'にます', 'ります', 'ます']},
    {name: 'plain negative', forms: ['わない', 'かない', 'がない', 'さない', 'たない', 'まない', 'ばない', 'なない', 'らない', 'ない']},
    {name: 'polite negative', forms: ['いません', 'きません', 'ぎません', 'しません', 'ちません', 'みません', 'びません', 'にません', 'りません', 'ません']},
    {name: 'curt negative (archaic)', forms: ['わん', 'かん', 'がん', 'さん', 'たん', 'まん', 'ばん', 'なん', 'らん', 'ん']},
    {name: 'polite negative (archaic)', forms: ['いませぬ', 'きませぬ', 'ぎませぬ', 'しませぬ', 'ちませぬ', 'みませぬ', 'びませぬ', 'にませぬ', 'りませぬ', 'ませぬ']},

    // past tense: 6-9
    {name: 'past tense', forms: ['った', 'いた', 'いだ', 'した', 'った', 'んだ', 'んだ', 'んだ', 'った', 'た']},
    {name: 'polite affirmative', forms: ['いました', 'きました', 'ぎました', 'しました', 'ちました', 'みました', 'びました', 'にました', 'りました', 'ました']},
    {name: 'plain negative', forms: ['わなかった', 'かなかった', 'がなかった', 'さなかった', 'たなかった', 'まなかった', 'ばなかった', 'ななかった', 'らなかった', 'なかった']},
    {name: 'polite negative', forms: ['いませんでした', 'きませんでした', 'ぎませんでした', 'しませんでした', 'ちませんでした', 'みませんでした', 'びませんでした', 'にませんでした', 'りませんでした', 'ませんでした']},

    // perfect: 10
    {name: 'negative perfect', forms: ['わず(に)', 'かず(に)', 'がず(に)', 'さず(に)', 'たず(に)', 'まず(に)', 'ばず(に)', 'なず(に)', 'らず(に)', 'ず(に)']},

    // ta form: 11
    {name: 'representative', forms: ['ったり', 'いたり', 'いだり', 'したり', 'ったり', 'んだり', 'んだり', 'んだり', 'ったり', 'たり']},

    // renyoukei: 12-13
    {name: 'conjunctive', forms: ['い-', 'き-', 'ぎ-', 'し-', 'ち-', 'み-', 'び-', 'に-', 'り-', '-']},
    {name: 'way of doing', forms: ['いかた', 'きかた', 'ぎかた', 'しかた', 'ちかた', 'みかた', 'びかた', 'にかた', 'りかた', 'かた']},

    // te forms: 14-22
    {name: 'te form', forms: ['って', 'いて', 'いで', 'して', 'って', 'んで', 'んで', 'んで', 'って', 'て']},
    {name: 'te iru', forms: ['っている', 'いている', 'いでいる', 'している', 'っている', 'んでいる', 'んでいる', 'んでいる', 'っている', 'ている']},
    {name: 'simplified te iru', forms: ['ってる', 'いてる', 'いでる', 'してる', 'ってる', 'んでる', 'んでる', 'んでる', 'ってる', 'てる']},
    {name: 'te aru', forms: ['ってある', 'いてある', 'いである', 'してある', 'ってある', 'んである', 'んである', 'んである', 'ってある', 'てある']},
    {name: 'simplified te ageru', forms: ['ったげる', 'いたげる', 'いだげる', 'したげる', 'ったげる', 'んだげる', 'んだげる', 'んだげる', 'ったげる', 'たげる']},
    {name: 'te oru', forms: ['っておる', 'いておる', 'いでおる', 'しておる', 'っておる', 'んでおる', 'んでおる', 'んでおる', 'っておる', 'ておる']},
    {name: 'simplified te oru', forms: ['っとる', 'いとる', 'いどる', 'しとる', 'っとる', 'んどる', 'んどる', 'んどる', 'っとる', 'とる']},
    {name: 'te oku', forms: ['っておく', 'いておく', 'いでおく', 'しておく', 'っておく', 'んでおく', 'んでおく', 'んでおく', 'っておく', 'ておく']},
    {name: 'simplified te oku', forms: ['っとく', 'いとく', 'いどく', 'しとく', 'っとく', 'んどく', 'んどく', 'んどく', 'っとく', 'とく']},

    // tai/tageru: 23-24
    {name: 'desire', forms: ['いたい', 'きたい', 'ぎたい', 'したい', 'ちたい', 'みたい', 'びたい', 'にたい', 'りたい', 'たい']},
    {name: "other's desire", forms: ['いたがる', 'きたがる', 'ぎたがる', 'したがる', 'ちたがる', 'みたがる', 'びたがる', 'にたがる', 'りたがる', 'たがる']},

    // pseudo-futurum forms: 25-30
    {name: 'pseudo futurum', forms: ['おう', 'こう', 'ごう', 'そう', 'とう', 'もう', 'ぼう', 'のう', 'ろう', 'よう']},
    {name: 'polite presumptive', forms: ['うでしょう', 'くでしょう', 'ぐでしょう', 'すでしょう', 'つでしょう', 'むでしょう', 'ぶでしょう', 'ぬでしょう', 'るでしょう', 'るでしょう']},
    {name: 'plain presumptive', forms: ['うだろう', 'くだろう', 'ぐだろう', 'すだろう', 'つだろう', 'むだろう', 'ぶだろう', 'ぬだろう', 'るだろう', 'るだろう']},
    {name: 'polite negative presumptive', forms: ['わないだろう', 'かないだろう', 'がないだろう', 'さないだろう', 'たないだろう', 'まないだろう', 'ばないだろう', 'なないだろう', 'らないだろう', 'ないだろう']},
    {name: 'plain negative presumptive', forms: ['うまい', 'くまい', 'ぐまい', 'すまい', 'つまい', 'むまい', 'ぶまい', 'ぬまい', 'るまい', 'まい']},
    {name: 'past presumptive', forms: ['ったろう', 'いたろう', 'いだろう', 'したろう', 'ったろう', 'んだろう', 'んだろう', 'んだろう', 'った', 'たろう']},

    // izenkei / kateikei: 31-32
    {name: 'hypothetical', forms: ['えば', 'けば', 'げば', 'せば', 'てば', 'めば', 'べば', 'ねば', 'れば', 'れば']},
    {name: 'past hypothetical', forms: ['ったら', 'いたら', 'いだら', 'したら', 'ったら', 'んだら', 'んだら', 'んだら', 'ったら', 'たら']},
    {name: 'short potential', forms: ['える', 'ける', 'げる', 'せる', 'てる', 'める', 'べる', 'ねる', 'れる', '']},

    // saserareru: 33-35
    {name: 'passive', forms: ['われる', 'かれる', 'がれる', 'される', 'たれる', 'まれる', 'ばれる', 'なれる', 'られる', 'られる']},
    {name: 'causative', forms: ['わせる', 'かせる', 'がせる', 'させる', 'たせる', 'ませる', 'ばせる', 'なせる', 'らせる', 'させる']},
    {name: 'causative passive', forms: ['わせられる', 'かせられる', 'がせられる', 'させられる', 'たせられる', 'ませられる', 'ばせられる', 'なせられる', 'らせられる', 'させられる']},

    // commands: 36-41
    {name: 'requesting', forms: ['ってください', 'いてください', 'いでください', 'してください', 'ってください', 'んでください', 'んでください', 'んでください', 'ってください', 'てください']},

    {name: 'commanding', forms: ['え', 'け', 'げ', 'せ', 'て', 'め', 'べ', 'ね', 'れ', 'ろ']},
    {name: 'authoritative', forms: ['いなさい', 'きなさい', 'ぎなさい', 'しなさい', 'ちなさい', 'みなさい', 'びなさい', 'になさい', 'りなさい', 'なさい']},
    {name: 'advisory', forms: ['', '', '', '', '', '', '', '', '', 'よ']},
    {name: 'negative request', forms: ['わないでください', 'かないでください', 'がないでください', 'さないでください', 'たないでください', 'まないでください', 'ばないでください', 'なないでください', 'らないでください', 'ないでください']},
    {name: 'negative imperative', forms: ['うな', 'くな', 'ぐな', 'すな', 'つな', 'むな', 'ぶな', 'ぬな', 'るな', 'るな']},

    // belief about [...]ness: 42-44
    {name: 'looks to be the case', forms: ['いそう', 'きそう', 'ぎそう', 'しそう', 'ちそう', 'みそう', 'びそう', 'にそう', 'りそう', 'そう']},
    {name: 'claimed to be the case', forms: ['うそう', 'くそう', 'ぐそう', 'すそう', 'つそう', 'むそう', 'ぶそう', 'ぬそう', 'るそう', 'るそう']},
    {name: 'apparently the case', forms: ['うらしい', 'くらしい', 'ぐらしい', 'すらしい', 'つらしい', 'むらしい', 'ぶらしい', 'ぬらしい', 'るらしい', 'るらしい']}
];

conjugationForms.sort(function (a, b) {return b.forms[0].length - a.forms[0].length;});

const verbTypes = ['v5u', 'v5k', 'v5g', 'v5s', 'v5t', 'v5m', 'v5b', 'v5n', 'v5r', 'v1'];
const verbEndings = ['う', 'く', 'ぐ', 'す', 'つ', 'む', 'ぶ', 'ぬ', 'る', 'る'];
let newword;

const process = function (/** @type {string} */ word, /** @type {any[]} */ seen, /** @type {any[]} */ aggregated, /** @type {{ name: any; forms?: string[]; }} */ entry, /** @type {number} */ i, /** @type {string} */ suffix, /** @type {number} */ j) {
    if (!suffix.trim()) {return;}
    const re = new RegExp(suffix + '$');
    if (word.match(re)) {
        newword = word.replace(re, verbEndings[j]);
        // special check for する
        if (newword === 'す') {newword = 'する';}
        // terminal check for orphan v1
        if (newword === 'る') {return;}
        aggregated.push(destep(newword, seen.concat({
            word: newword,
            found: entry.name,
            verbType: verbTypes[j]
        })));
    }
};

var destep = function (/** @type {any} */ word, /** @type {string | any[] | undefined} */ seen) {
    seen = seen || [];
    /**
     * @type {string | any[]}
     */
    const aggregated = [];
    conjugationForms.forEach(function (entry, i) {
        entry.forms.forEach(function (suffix, j) {
            process(word, seen, aggregated, entry, i, suffix, j);
        });
    });
    if (aggregated.length === 0) {return seen.slice();}
    return aggregated;
};

/**
 * conjugate a verb
 * @param verb
 * @param type
 */
const conjugate = function (/** @type {string} */ verb, /** @type {string} */ type) {
    type = type || 'v5';
    let index, verbstem, ret = [];
    if (type.toLowerCase().indexOf('v1') > -1) {
        index = verbTypes.indexOf('v1');
        verbstem = verb.substring(0, verb.length - 1);
    } else {
        const lastchar = verb.substring(verb.length - 1, verb.length);
        index = verbEndings.indexOf(lastchar);
        verbstem = verb.substring(0, verb.length - 1);
    }
    let i, e = conjugationForms.length, form, specific;
    for (i = 0; i < e; i++) {
        form = conjugationForms[i];
        specific = form.forms[index];
        if (specific !== false) {
            ret.push({name: form.name, form: verbstem + specific});
        }
    }
    return ret;
};

/**
 * try to find the original verb for a conjugation
 * @param word
 * @param verbtype
 */
const unconjugate = function (/** @type {any} */ word, /** @type {any} */ verbtype) {
    const result = destep(word);
    return result;
};
