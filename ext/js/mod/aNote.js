/* eslint-disable */
/* globals Dict, aDict, aNote, merge, aIn, wn */
import {aDict} from '../mod/aDict.js';
import {merge, aIn} from './aUtil.js';
import {wn, av} from './aDict.js';
import {store, retrieve, dbinit} from './aDb.js'
import {convertToKana} from '../language/ja/japanese-wanakana.js';
import {isStringEntirelyKana} from '../language/ja/japanese.js';
import {Db} from './aSql.js';

var nv = (/** @type {string} */ v) => {
    return localStorage.getItem(v) == 'true'
}

function chunkData(data, chunkSize) {
    const chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
        chunks.push(data.slice(i, i + chunkSize));
    }
    return chunks;
}

async function sendBatchedData(url, chunks) {
    try {
        const responses = await Promise.all(
            chunks.map(async (chunk, index) => {
                const chunkOptions = {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(chunk),
                };
                const response = await fetch(`${url}/chunk-${index}`, chunkOptions);
                return response;
            })
        );

        const success = responses.every((response) => response.ok);
        if (success) {
            return {success: true, message: 'Data uploaded successfully'};
        } else {
            throw new Error('Failed to upload data');
        }
    } catch (error) {
        throw new Error('Failed to upload data: ' + error.message);
    }
}
// Function to apply the comparison operator to the value and targetValue
/**
 * @param {string | number} value
 * @param {string} comparison
 * @param {string | number} targetValue
 */
function applyComparison(value, comparison, targetValue) {
    // Check if the value can be parsed as a number
    if (!isNaN(parseFloat(value))) {
        value = parseFloat(value); // Convert the value to float if it's a number
    }

    // Apply the comparison operator to the value and targetValue
    switch (comparison) {
        case '>':
            return value > targetValue;
        case '<':
            return value < targetValue;
        case '>=':
            return value >= targetValue;
        case '<=':
            return value <= targetValue;
        case '==':
            return value === targetValue;
        case '!=':
            return value !== targetValue;
        default:
            throw new Error('Invalid comparison operator: ' + comparison);
    }
}
/**
 * @param {string | number} value
 * @param {any} conversion
 */
function time(value, conversion) {
    var date;
    var day, month, year, hours, minutes, seconds;

    if (conversion) {
        date = new Date(value * 1000);
        day = date.getDate().toString().padStart(2, '0');
        month = (date.getMonth() + 1).toString().padStart(2, '0');
        year = date.getFullYear();
        hours = date.getHours().toString().padStart(2, '0');
        minutes = date.getMinutes().toString().padStart(2, '0');
        seconds = date.getSeconds().toString().padStart(2, '0');
        var formattedDate = day + '/' + month + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;

        return formattedDate;
    } else {
        var parts = value.split(' ');
        var dateParts = parts[0]?.split('/') ?? ['1', '1', '2000'];
        var timeParts = parts[1]?.split(':') ?? ['0', '0', '0'];
        day = parseInt(dateParts[0], 10);
        month = parseInt(dateParts[1], 10) - 1;
        year = parseInt(dateParts[2], 10);
        hours = parseInt(timeParts[0], 10);
        minutes = parseInt(timeParts[1], 10);
        seconds = parseInt(timeParts[2], 10);
        date = new Date(year, month, day, hours, minutes, seconds);
        var timestamp = Math.floor(date.getTime() / 1000);

        return timestamp;
    }
}
export class Note {
    constructor(u = null, dict = null, anki = null) {
        /**
         * @type {any}
         */
        this.dic = u;
        /**
         * @type {aDict | null}
         */
        this.aDict = dict ?? window.aDict ?? null
        /**
         * @type {import("../display/display-anki").DisplayAnki | null}
         */
        this.anki = anki
        this.mined = [0, 0, [], []]
        this.vars = {}
        this.svClk = this.svClk.bind(this);
        this.saveAdd = this.saveAdd.bind(this);
        this.url = "https://yomu-d9ca6-default-rtdb.firebaseio.com/save"
        this.db = new Db()
    }

    /**
     * @param {any[]} dic
     */
    async addAnki(dic, kanji = '', kana = '', o = {}, q = 1, i = 0) {
        try {
            const det = await this.aDict?.anki._getDictionaryEntryDetails(dic)

            const mode = 'term-kanji'

            let req = [
                {
                    "type": "selectionText"
                },
                {
                    "type": "dictionaryMedia",
                    "dictionary": "Jitendex [2023-12-12]",
                    "path": "jitendex/1-dan.svg"
                },
                {
                    "type": "dictionaryMedia",
                    "dictionary": "Jitendex [2023-12-12]",
                    "path": "jitendex/transitive.svg"
                },
                {
                    "type": "dictionaryMedia",
                    "dictionary": "Jitendex [2023-12-12]",
                    "path": "jitendex/Kansai.svg"
                },
                {
                    "type": "clipboardImage"
                },
                {
                    "type": "screenshot"
                },
                {
                    "type": "audio"
                }
            ];
            console.warn(det, req, mode);
            if (det) req = det[0].modeMap.get(mode);
            if (req.note.PrimaryDefinitionPicture === '') {
                let img = await this.aDict.txtImg(true)
                req.note.fields.PrimaryDefinitionPicture = img
            }
            console.warn(req);
            if (nv('log')) console.log(mode, req, dic, q) // Output: "term-kanji"
            // Call the addAnkiNote function
            await this.aDict.anki._addAnkiNote(dic[i], mode, q, req, o)
        } catch (error) {
            console.error(error)
        }
    }

    /**
     * @param {any} word
     * @param {any} sentence
     */
    async create(
        word,
        sentence,
        definition = '',
        frequencies = [],
        frequencyMedian = 0,
        tags = [],
        audio = [],
        html = '',
        image = [],
        timestamp = Date.now(),
        time = new Date(),
        status = 'new',
        flagNumber = 0,
        id = Math.floor(Math.random() * 1000),
        clip = '',
        definitions = [],
        reading = '',
        sentenceReading = '',
        hint = '',
        pitch = '',
        extra = null,
        pitchPos = [],
        dicts = [],
        otherSentences = [],
        type = '',
        learning = 1,
        known = 0,
        size = 0,
        wordLength = 0,
        occurrences = 1,
        chars = [],
        alternatives = [],
        synonyms = [],
        antonyms = [],
        urlLoc = document.URL,
        day = 0,
        options = [],
        seen = true,
        temp = false,
        isAnki = false,
        hasSAudio = false,
        hasWAudio = false,
        hasImages = false,
        moe = false,
        comment = '',
        prev = '',
        clips = [],
        info = {},
        notes = [],
        anki = {},
        ankiId = -1
    ) {
        try {
            const obj = {
                word,
                sentence,
                definition,
                frequencies,
                frequencyMedian,
                tags,
                url: document.URL,
                clipboard: clip,
                audio,
                html,
                image,
                timestamp,
                time,
                status,
                flagNumber,
                id,
                definitions,
                reading,
                sentenceReading,
                hint,
                pitch,
                extra,
                pitchPos,
                dicts,
                otherSentences,
                type,
                learning,
                known,
                size,
                wordLength,
                occurrences,
                chars,
                alternatives,
                synonyms,
                antonyms,
                urlLoc,
                day,
                options,
                seen,
                temp,
                isAnki,
                hasSAudio,
                hasWAudio,
                hasImages,
                moe,
                comment,
                prev,
                clips,
                info,
                notes,
                anki,
                ankiId
            }

            const result = {
                id,
                word,
                sentence,
                definition,
                frequencies,
                frequency_median: frequencyMedian,
                tags,
                url: urlLoc,
                clipboard: clip,
                audio,
                html,
                image,
                timestamp: timestamp.toString(),
                time: time.toISOString(),
                status,
                flag_number: flagNumber,
                definitions,
                reading,
                sentence_reading: sentenceReading,
                hint,
                pitch,
                extra,
                pitch_pos: pitchPos,
                dicts,
                other_sentences: otherSentences,
                type,
                learning,
                known,
                size,
                word_length: wordLength,
                occurrences,
                chars,
                alternatives,
                synonyms,
                antonyms,
                url_loc: urlLoc.substring(0, 19),
                day,
                options,
                seen,
                temp,
                is_anki: isAnki,
                has_s_audio: hasSAudio,
                has_w_audio: hasWAudio,
                has_images: hasImages,
                moe,
                comment,
                prev,
                clips,
                info,
                notes,
                anki,
                anki_id: ankiId
            }
            if (nv('log')) console.log(result, ' Added values:', obj)
            try {
                // Send a POST request to the API endpoint
                const response = await fetch('http://localhost:3000/api/word', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(result)
                })
                if (nv('warn')) console.warn('PostgresSQL DB ', response)
                if (response.ok) {
                    // Word added successfully
                    const wordObject = await response.json()
                    if (nv('log')) console.log('Word created:', wordObject)
                } else {
                    // Error adding word
                    console.error('Failed to create word:', response.status)
                }
            } catch (serr) {
                console.error(serr)
            }
            return obj
        } catch (error) {
            console.error('An error occurred:', error)
            return {}
        }
    }

    async getFileContents() {
        try {
            const response = await fetch('save.json')
            const contents = await response.json()
            return contents
        } catch (error) {
            console.error('An error occurred:', error)
            return null
        }
    }

    /**
     * @param {any} jsonData
     */
    async setFileContents(jsonData) {
        try {
            const opts = {
                create: true,
                exclusive: false,
                suggestedName: 'save.json',
                types: [
                    {
                        description: 'JSON Files',
                        accept: {
                            'application/json': ['.json']
                        }
                    }
                ]
            }
            const fileHandle = await window.showSaveFilePicker(opts)
            console.dir(fileHandle)
            if (nv('warn')) console.warn(fileHandle)
            const writable = await fileHandle.createWritable()
            if (nv('warn')) console.warn(writable)
            await writable.write('write', jsonData)
            await writable.close()
        } catch (error) {
            console.error('An error occurred:', error)
        }
    }
    nobj(on, i, dateString, unixSeconds, txt) {
        on[i].status += 1
        on[i].sentence += '\n' + txt
        if (on[i].time) {
            on[i].time += ' ' + dateString ?? unixSeconds
        } else {
            on[i].time = dateString ?? unixSeconds
        }
    }
    /**
     * @param {string | undefined} t
     * @param {string} txt
     */
    async saveAdd(cx = 0, t, txt, def = '', fq = [], tags = [], html = '', moe = false, audio = [], image = [], clip = '', yc = false, read = '', elem = null, keys = [false, false]) {
        try {
            const log = {
                dict: this.dic,
                t,
                txt,
                def,
                fq,
                tags,
                html,
                moe,
                audio,
                image,
                clip,
                yc,
                read,
                cx,
                noteEnv: this
            }
            console.dir(log)
        } catch (ler) {
            console.error(ler)
        }
        var results;
        try {
            //let tu = await unconjugate(t);
            //if (tu) t = tu;
            let lt = t
            try {
                const options = this.aDict._display.getOptionsContext()
                results = await this.aDict._display._findDictionaryEntries(false, t, false, options)
                if (!keys[0] && isStringEntirelyKana(t)) {
                    let l = 0
                    for (let r of results) {
                        t = r.headwords[0].term
                        if (!this.words.includes(t) || (l > 0 && l != t.length)) {
                            break
                        }
                        if (l < 1) l = t.length
                    }
                }
            } catch (rr) {
                console.error(rr);
            }
            if (lt !== t) {
                this.saveAdd(cx, lt, txt, def, fq, tags, html, moe, audio, image, clip, yc, read, elem, [true, true])
            }
            const note = window.aNote
            const noteMod = Object.create(Note.prototype, {dict: this})
            const storedDay = parseInt(await this.getter('day'))
            const day = aDict.prototype.int('day') ?? -1 //isNaN(storedDay) ? 0 : storedDay
            const unixSeconds = Math.floor(Date.now() / 1000); // Current Unix timestamp
            //const date = new Date(unixSeconds * 1000).getDate();
            await this.setter('unix', unixSeconds)
            const d = new Date()
            const currentDate = d.getDate()
            const flag = currentDate !== day ? 1 : 0
            await this.setter('day', currentDate)
            let iCur = parseInt(await this.getter('cur'))
            iCur += 1
            if (nv('warn')) console.warn([t, txt, def, fq, tags, html, moe, audio, image, clip])
            this.show()
            let options = {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                weekday: 'short',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                timeZone: 'America/Sao_Paulo',
                timeZoneName: 'short'
            };
            let dateString = new Date().toLocaleString('pt-BR', options).replaceAll(',', '');

            let word = await this.getter('words')
            word = word.replace(/(\d{1,2}-\d{1,2}-\d{4}-\d{1,2}:\d{1,2}: )|(\w{3} \w{3} \d{2} \d{4} \d{2}:\d{2}:\d{2} \w{3}-\d{4} \(\w{3}\))/g, '')
            // note.setFileContents({ day: date.toString(), lastAccess: d, words: t, sentences: txt, html: html });

            let ww
            let w2
            if (cx >= 0) {
                ww = word.split(' ')
            }
            let isStringInSet = ww.includes(t)

            const saveDiv = document.querySelector('.save')
            if (nv('warn')) console.warn(cx, isStringInSet, ww, w2, t)
            //if (cx == -1) return
            var keep = cx >= 1 || this.aDict?.saving
            if (keep) {
                let k = await this.getter('keep') ?? ''
                await this.setter('keepbackup', k)
                let ks = k.split(' ')
                let filt = false
                let is = ks.includes(t)
                /*if (!is) {
                    ks = ks.map(word => {
                        const lastIndex = word.indexOf(t);
                        if (lastIndex !== -1) {
                            filt = true
                            return word.replace(t, '');
                        } else {
                            return word;
                        }
                    });
                    await this.setter('keep', ks.join(' '))
                    /*ks.some((word, i) => {
                      const lastIndex = word.indexOf(t);
                      if (lastIndex !== -1) {
                          ks.splice(i, 1)
                          await this.setter('recyclebin', word)
                          return word;
                      }
                  });*/
                //}
                if (!is && !filt) {
                    ks.push(t)
                    k = ks.join(' ')
                    // elem.style.borderColor = 'green'
                    elem.style.borderColor = 'aqua'
                    await this.setter('keep', k)
                    try {
                        this.db.set(1, {
                            keep: k
                        }, 1)
                    } catch (error) {
                        console.error(error);
                    }
                } else {
                    const kf = ks.filter(item => item !== t);
                    k = kf.join(' ')
                    elem.style.borderColor = 'red'
                    let d = await this.getter('recycle') ?? []
                    let dl = []
                    if (typeof d === 'string') {
                        dl = d.split(' ') ?? []
                    }
                    dl.push(t)
                    await this.setter('recycle', dl.join(' '))
                    // if (!filt) this.delete('word', t, '==')
                    await this.setter('keep', k)
                    try {
                        this.db.set(1, {
                            keep: k
                        }, 1)
                    } catch (error) {
                        console.error(error);
                    }
                }
            } else {
                elem.style.borderColor = 'lime'
            }
            const objin = async () => {
                let on = this.obj;
                let ow = await this.find(t, "word");

                if (ow?.length > 2) {
                    let ox = ow[0]
                    for (let i in ox) {
                        this.nobj(on, i, dateString, unixSeconds, txt)
                    }
                } else {
                    this.nobj(on, ow[1], dateString, unixSeconds, txt)
                }
                await this.setter('save', JSON.stringify(on))
            }
            if (!this.aDict?.atAnki(t)) {
                let ain
                try {
                    let js = this.aDict._jpws
                    ain = av("anki") ? true : false //aIn(t, js)
                } catch (zx) {
                    console.error(zx);
                }
                if (ain) {
                    //ain.then(() => {
                    let so = {
                        st: txt,
                        sound: false,
                        deck: await this.getter('deck') ?? 'aDict',
                        gameDeck: await this.getter('gamedeck') ?? 'VG'
                    }
                    note.addAnki(results, t, read, so, results.length)
                    this.aDict._jpws += ' ' + t
                    localStorage.setItem('jpws', this.aDict._jpws)
                    elem.classList.add('mined')
                    //})
                }
            }
            if ((isStringInSet && cx >= 0)) {
                const bsWithoutString = ww.filter(function (element) {
                    return element !== t
                })
                ww = bsWithoutString
                ww.push(t)
                if (cx == 0) {
                    await this.setter('words', ww.join(' '))
                }
                note.svDiv(saveDiv, ww.join(' '), flag)
                if (await this.find(t) ? true : false) {
                    await objin()
                }
                return isStringInSet
            } else if (cx < -1) {
                let b = await this.getter('exp') ?? ''
                b = b.split(' ')
                isStringInSet = b.includes(t)
                if (isStringInSet) {
                    if (nv('log')) console.log('In');
                } else {
                    b.push(t)
                    await this.setter('exp', b.join(' '))
                }
            } else if (!isStringInSet) {
                let fm = fq.reduce((a, b) => a + b, 0)
                fm /= fq.length
                const ws = word ? word.split(' ') : []
                ws.push(t)
                const filteredArray = [...new Set(ws)]
                word = filteredArray
                //if(flag == 1){
                //word[word.length-1] = `\n ${word[word.length-1]}`
                //}
                word = word.join(' ')
                await this.setter('words', word)
                try {
                    this.db.set(1, {
                        words: word
                    }, 1)
                } catch (errpr) {
                    console.error(error);
                }
                // if (nv('warn')) console.warn(options, yc, read, results, fq, fq.length)
                if (fq.length == 0) {
                    let sum = 0;
                    const frequencies = results[0].frequencies;
                    frequencies.forEach((/** @type {{ frequency: any; }} */ item) => {
                        //sum += item.frequencyValue;
                        if (nv('log')) console.log(item);
                        fq.push(item.frequency)
                    });
                }
                fq = fq.join(' ')
                try {
                    let tf = await this.find(t)
                    if (!tf) {
                        let oc = {
                            word: t,
                            reading: read,
                            sentence: txt,
                            definition: def,
                            frequency: fq,
                            type: keep ? "keep" : "words",
                            learning: 0,
                            clipboard: clip?.substring(0, 5) === txt.substring(0, 5) ? '' : clip?.substring(0, 80),
                            status: cx < 1 ? 1 : cx,
                            time: dateString,
                            params: `Yc:${yc} Cx:${cx} Flag:${flag}`
                        }
                        let sv = await this.getter('save') ?? {}
                        let sj = sv
                        if (typeof sv !== 'object') {
                            sj = JSON.parse(sv)
                        }
                        let o = {
                            ...sj,
                            [unixSeconds]: oc
                        }
                        if (nv('warn')) console.warn(word, o)
                        localStorage.setItem('save', JSON.stringify(o));
                        this.put(o, '/save')
                        oc.id = unixSeconds
                        this.db?.add(oc)
                    } else if (tf?.[0].sentence != txt) {
                        this.obj()
                    }
                } catch (se) {
                    console.error(se);
                }
            } else {
                if (nv('warn')) console.warn(`${t} already exists`)
            }
            note.svDiv(saveDiv, word, flag)
        } catch (e) {
            console.error(e)
        }
    }

    /**
     * @param {HTMLDivElement} saveDiv
     */
    async svDiv(saveDiv, sz = null, _flag = '', m = false) {
        if (!sz) {
            sz = await this.getter('words')
        }
        if (sz instanceof Promise) {
            sz = await sz
        }
        if (!m) {
            sz = merge(sz.split(' '))
        }
        let s3 = saveDiv.querySelector(".w")
        let cache = saveDiv.querySelector(".cache")
        if (!cache) {
            cache = document.createElement('div')
            cache.className = 'cache'
            saveDiv.prepend(cache)
            s3 = saveDiv.appendChild(document.createElement('div'))
            s3.className = 'w'
        }
        cache.innerHTML = `${await this.getter('navsave')}: ${await this.getter('navsentence')}`
        if (saveDiv) {
            let wordsOnly = sz // .replace(/(\d{1,2}-\d{1,2}-\d{4}-\d{1,2}:\d{1,2}: )|(\w{3} \w{3} \d{2} \d{4} \d{2}:\d{2}:\d{2} \w{3}-\d{4} \(\w{3}\))/g, '');
            wordsOnly = wordsOnly.split(' ')
            wordsOnly = wordsOnly.slice(wordsOnly.length - 32).join(' ')
            s3.innerHTML = wordsOnly
        } else {
            console.error("Could not find element with class 'save'.")
        }
    }


    /**
     * @param {{ innerHTML: any; querySelector: (arg0: string) => string; getAttribute: (arg0: string) => string; classList: { add: (arg0: string) => void; }; parentElement: { getAttribute: (arg0: string) => any; }; querySelectorAll: (arg0: string) => any; }} elem
     */
    async svClk(elem, cx = 0, tw = '', mode = 0, _yc = null, clip = '', img = [], snd = [], keys = [false, false]) {
        if (this.aDict) {
            this.aDict.new = false
        }
        const fq = []
        let df = ''
        const ht = elem?.innerHTML
        const tag = ['aDict', `v0.2-${new Date().toISOString().slice(0, 7)}`]
        if (nv('log')) console.log(elem, tag.join(', '))
        if (cx < 0) {
            img = this.dic.main.txtImg(true)
            await new Promise((r) => setTimeout(r, 3000))
        }
        let tx = elem.getAttribute('w') ?? ''
        if (mode == 0 && !this.mined[3].includes(tx)) {
            this.mined[1] += 1
            this.mined[3].push(tx)
        }
        try {
            let pos = this.aDict.getLine(elem)
            this.aDict.cache(elem, this.aDict.istart, pos + ' ' + cx)
            //if (img == []) {            }
            if (clip == '') {
                clip = this.dic.main.getText()
            }
            console.dir([img, clip])
        } catch (ser) {
            console.error(ser)
        }
        let kj = elem.querySelector('.yomi')// ? document.querySelector("span.kj") :
        df = kj ? elem.querySelector('.yomi .entry-body ul:nth-child(1) > li') : elem.querySelector('.gloss-desc')
        if (df) {
            df = df.innerText
        }
        const I = parseInt(elem.getAttribute('ind'))
        let rd = document.querySelector(`[i="${I}"] .reading`)
        if (rd) {
            rd = rd.innerText
        }
        if (!kj) {
            rd = elem.querySelector('.rd').innerText
            rd = convertToKana(rd)
        }
        /*let fv = document.querySelectorAll('.fav')
        if (nv('warn')) console.warn(fv, rd)
        if (fv.length > 0) {
            for (let f of fv) {
                f.style.height = this.aDict.width
                f.style.flex = this.aDict.height
                f.style.setProperty('--cc', 'blue')
            }
        }*/
        elem.classList.add('fav')
        const note = this //new Note(this.dic) // Create an instance of the Note class
        if (isNaN(cx)) {
            cx = 0
        }
        const xt = elem.getAttribute('wset') ?? elem.parentElement.getAttribute('txt')
        let st = xt //?.substring(0, 80)
        if (cx <= 50) {
            const k = elem.querySelector('.kj')
            if (nv('warn')) console.warn(k.innerHTML) // console.dir(kj)
            if (nv('warn')) console.warn(kj, I, df, rd)
            if (kj == null) {
                kj = !!elem.querySelector('.entry-body')
            }
            if (kj) {
                try {
                    // elem.style.fontSize = '1.2em'
                    const fs = elem.querySelectorAll('.frequency-value')
                    for (const f of fs) {
                        fq.push(parseInt(f.innerText))
                    }
                } catch { }
                df = elem.querySelector('li').innerText
                rd = elem.querySelector('rt').innerText
                // let cpn = document.createElement('div')
                let en = this.aDict.yomiread(elem)
                if (nv('log')) console.log(en)
                const wn = en // ?? elem.getAttribute('w')
                // rd = elem.querySelector('rt')
                // en = cpn.innerText
                //
                // async saveAdd(t, txt, def = '', fq = [], tags = [], html = '', moe = false, audio = [], image = [], clip = '', yc = null) {
                await note.saveAdd(cx, wn, st, df, fq, tag, ht, false, snd, img, clip, true, rd, elem, keys)// localStorage.setItem('save', `${save} ${en}`)
            } else {
                let word = k ? k.innerText : ''
                if (!keys[1]) {
                    let kp = await this.getter('keep') ?? ''
                    let ks = kp.split(' ')
                    let is = ks.includes(word)
                    if (!is) {
                        let wordel = elem.querySelector(".compounds dt") ?? elem.querySelector(".conj-gloss dt")
                        if (wordel) {
                            word = wordel.textContent
                            let sp = word.split(' ')
                            word = sp ? sp[0] : word
                            rd = sp.length > 1 ? sp[1].substring(1, sp[1].length - 1) : rd
                        }
                    }
                }
                //try { //df += elem.querySelector('dt').innerText } finally {
                await note.saveAdd(cx, word, st, df, undefined, tag, ht, true, snd, img, clip, true, rd, elem, keys) // localStorage.setItem('save', `${save} ${k.innerHTML}`)
            }
        } else {
            try {
                df += elem.querySelector('dt').innerText
            } catch { }
            await note.saveAdd(cx, tw, st, df, undefined, tag, ht, true, snd, img, clip, undefined, rd, elem, keys)
        }
    }
    duplicates(obj) {
        // Create an empty object to store unique values
        var uniqueObj = {};

        // Iterate over each key-value pair in the original object
        for (var key in obj) {
            var value = obj[key];

            // Check if the value already exists in the unique object
            var isDuplicate = false;
            for (var uniqueKey in uniqueObj) {
                if (uniqueObj.hasOwnProperty(uniqueKey)) {
                    if (uniqueObj[uniqueKey].word === value.word) {
                        isDuplicate = true;
                        uniqueObj[uniqueKey].status += 1
                        // Merge the time and sentence properties
                        uniqueObj[uniqueKey].time += ' ' + value.time;
                        if (uniqueObj[uniqueKey].sentence != value.sentence) {uniqueObj[uniqueKey].sentence += '\n' + value.sentence;}

                        break;
                    }
                }
            }

            // If the value is unique, add the key-value pair to the unique object
            if (!isDuplicate) {
                uniqueObj[key] = value;
            }
        }

        return uniqueObj;
    }
    /**
     * @param {ArrayLike<any> | { [s: string]: any; }} obj
     * @param {{ appendChild: (arg0: HTMLDivElement) => void; }} bo
     */
    displayObjectInHTML(obj, bo) {
        // Create a container element
        const container = document.createElement('div')
        container.className = 'saved' // Add the 'savd' class for styling (assuming it's defined in your CSS)
        // Iterate over the object properties
        for (const [key, value] of Object.entries(obj)) {
            // Create an item element for each property
            const item = document.createElement('div')
            item.className = 'item' // Add a class for styling (assuming it's defined in your CSS)

            // Create a title element for the property key
            const title = document.createElement('h3')
            title.textContent = key
            item.appendChild(title)

            if (typeof value === 'object' && value !== null) {
                const nestedContainer = document.createElement('div')
                nestedContainer.innerHTML = value[0]
                item.appendChild(nestedContainer)
            } else {
                const content = document.createElement('p')
                content.textContent = value
                item.appendChild(content)
            }

            // Append the item to the container
            container.appendChild(item)
        }

        // Append the container to the document body
        bo.appendChild(container)
    }
    show() {
        this.aDict.toast(`${this.mined[0]} / w${this.mined[1]}`, 2700)
    }
    /**
     * @param {string} type
     * @param {any} value
     * @param {any} comparison
     */
    async delete(type, value, comparison) {
        try {
            var a = await this.getter("save");
            var oc
            try {
                oc = JSON.parse(a)
            } catch {
                return null
            }
            // Validate input
            if (!type || !value) {
                throw new Error('Missing required parameters: type and value');
            }
            for (const key in oc) {
                if (Object.prototype.hasOwnProperty.call(oc, key)) {
                    const item = oc[key];
                    let shouldDelete = false;
                    switch (type) {
                        case 'timestamp':
                            shouldDelete = (item.time === value);
                            break;
                        case 'word':
                            shouldDelete = (item.word === value);
                            break;
                        case 'reading':
                            shouldDelete = (item.reading === value);
                            break;
                        case 'definition':
                            shouldDelete = (item.definition.includes(value));
                            break;
                        case 'frequency':
                            shouldDelete = applyComparison(item.frequency, comparison, value);
                            break;
                        case 'status':
                            shouldDelete = applyComparison(item.status, comparison, value);
                            break;
                        case 'param':
                            shouldDelete = (item.params.includes(value));
                            break;
                        case 'key':
                            shouldDelete = applyComparison(key, comparison, value);
                            break;
                        default:
                            throw new Error('Invalid criteria type: ' + type);
                    }
                    if (shouldDelete) {
                        delete oc[key];
                    }
                }
            }
            localStorage.setItem('save', JSON.stringify(oc));

        } catch (error) {
            console.error(error);
        }
    }
    async saveget(a = true) {
        if (a) {
            return await this.find('', 'word', '')
        } else {
            return await this.find()
        }
    }
    async find(query = '', prop = 'word', comparison = '=', oc = null) {
        try {
            if (!oc) {
                try {
                    var a = await this.getter("save");
                    if (typeof a !== 'object') {
                        oc = JSON.parse(a);
                    }
                } catch {
                    return null;
                }
            }
            /**
               * @type {any[]}
               */
            var result = [];
            var i = []
            for (var index in oc) {
                if (Object.prototype.hasOwnProperty.call(oc, index)) {
                    var item = oc[index];
                    var match = false;

                    if (comparison === '') {
                        // Return array of item[prop]
                        if (prop in item) {
                            result.push(item[prop]);
                        }
                    } else if (query === '') {
                        // Return all objects
                        result.push(item);
                    } else if (prop === 'key') {
                        // Query by index (key) comparison
                        if (applyComparison(index, comparison, query)) {
                            match = true;
                        }
                    } else if (prop in item) {
                        var value = item[prop];

                        if (typeof value === 'number' && typeof query === 'number') {
                            // Number comparison
                            if (applyComparison(value, comparison, query)) {
                                match = true;
                            }
                        } else if (comparison === 'search' && typeof value === 'string' && typeof query === 'string') {
                            // String search
                            if (value.includes(query)) {
                                match = true;
                            }
                        } else if (value === query) {
                            // Exact match
                            match = true;
                        }
                    }

                    if (match) {
                        i.push(index)
                        result.push(item);
                    }
                }
            }
            if (result.length === 0) {
                return null; // No matching objects found
            } else if (result.length === 1) {
                result.push(i)
                return result; // Return single matching object
            } else {
                result.push(i)
                return result; // Return array of matching objects
            }
        } catch (error) {
            console.error('An error occurred:', error.message);
            return null;
        }
    }
    /**
   * @param {any} w
   */
    async key(w) {
        try {
            var a = await this.getter("save");
            var oc = JSON.parse(a);
            for (var prop in oc) {
                if (Object.prototype.hasOwnProperty.call(oc, prop) && oc[prop].word === w) {
                    return prop;
                }
            }
            return null; // Word not found
        } catch (error) {
            console.error('An error occurred:', error.message);
            return null;
        }
    }
    /**
     * @param {any} k
     */
    async move(k, pos = -1) {
        try {
            var a = await this.getter("save");
            var oc
            try {
                oc = JSON.parse(a)
            } catch {
                return null
            }
            if (pos == -1) {
                this.moveEnd(oc, k)
            } else {
                this.movePos(oc, k, pos)
            }
            localStorage.setItem('save', JSON.stringify(oc));
        } catch (error) {
            console.error(error);
        }
    }
    /**
     * @param {{ [x: string]: any; } | null} obj
     * @param {PropertyKey} key
     */
    moveEnd(obj, key) {
        try {
            if (typeof obj !== 'object' || obj === null) {
                throw new Error('Invalid object. Expected an object.');
            }

            if (!Object.prototype.hasOwnProperty.call(obj, key)) {
                throw new Error('The provided key does not exist in the object.');
            }

            const keys = Object.keys(obj);
            const currentIndex = keys.indexOf(key);

            if (currentIndex === -1) {
                throw new Error('The provided key does not exist in the object.');
            }

            if (currentIndex === keys.length - 1) {
                // Key is already in the last position
                return obj;
            }

            const newKeys = [
                ...keys.slice(0, currentIndex),
                ...keys.slice(currentIndex + 1),
                key
            ];

            const result = {};

            let newKey = Math.floor(Date.now() / 1000); // Current Unix timestamp
            const value = obj[currentIndex];
            delete obj[currentIndex];
            obj[newKey] = value;
            return obj;
        } catch (error) {
            // Handle the error here
            console.error('An error occurred:', error.message);
            // You can choose to re-throw the error or return a default value, if desired
            throw error;
        }
    }
    async save() {
        const jsonStr = localStorage
        await this.saveObject(jsonStr, '/');
    }
    async saveObject(obj, path) {
        await Promise.all(
            Object.entries(obj).map(async ([key, value]) => {
                const currentPath = `${path}${key}`;
                if (typeof value === 'string') {
                    try {
                        const parsedObj = JSON.parse(value);
                        await this.saveObject(parsedObj, `${currentPath}/`);
                    } catch (err) {
                        await this.put(value, currentPath);
                    }
                } else if (typeof value === 'object' && value !== null) {
                    await this.saveObject(value, `${currentPath}/`);
                } else {
                    await this.put(value, currentPath);
                }
            })
        );
    }
    async getDb(url = '') {
        return await this.request(null, 'GET', url)
    }


    /**
     * Performs a request to the Firebase Realtime Database.
     * @param {object} data - The data to be sent in the request body.
     * @param {string} method - The HTTP method of the request (GET, POST, etc.).
     * @param {string} url - The URL of the database endpoint.
     * @returns {Promise<object>} A promise that resolves to the parsed response data.
     */
    async request(data, method, url = '') {
        try {
            url = this.url + url + '.json';

            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            if (method !== 'GET' && method !== 'HEAD') {
                // Check if the data is too large to send in a single request
                /*if (JSON.stringify(data).length > 1000000) {
                    // Chunk the data into smaller pieces
                    const chunks = chunkData(data, 1000);

                    // Use batched writes to upload the data
                    const response = await sendBatchedData(url, chunks);
                    return response;
                } else {*/
                options.body = JSON.stringify(data);
                //}
            }

            const response = await fetch(url, options);

            if (method === 'GET') {
                const responseData = await response.json();
                return responseData;
            }

            return response;
        } catch (error) {
            throw new Error('Failed to perform request: ' + error.message);
        }
    }
    async post(data, url = '') {
        return await this.request(data, 'POST', url)
    }
    /**
    * Performs a delete request to the Firebase Realtime Database.
    * @param {string} url - The URL of the database endpoint.
    * @param {object} data - The data to be sent in the request body.
    * @returns {Promise<object>} A promise that resolves to the parsed response data.
    */
    async del(url = '') {
        return await this.request(null, 'DELETE', url)
    }
    /**
    * Performs a POST request to the Firebase Realtime Database.
    * @param {string} url - The URL of the database endpoint.
    * @param {object} data - The data to be sent in the request body.
    * @returns {Promise<object>} A promise that resolves to the parsed response data.
    */
    async put(data, url = '') {
        return await this.request(data, 'PUT', url)
    }
    async dbset() {
        let d = await db()
        return d
    }
    /**
     * @param {boolean} k1
     * @param {boolean} k2
     * @param {Element} elem
     */
    keep(k1, k2, elem) {
        let t = elem.getAttribute('w') ?? ''
        let is = this.bin.includes(t)
        if (!is && !this.mined[2].includes(t)) {
            this.mined[0] += 1
            this.mined[2].push(t)
        }
        let v = 1
        let opt = k1 && k2 ? v + 2 : ((k1 || k2) ? v + 1 : v)
        this.svClk(elem, opt, undefined, 1, undefined, undefined, undefined, undefined, [k2, k1])
        return is
    }
    /**
     * @param {{ [x: string]: any; }} obj
     * @param {PropertyKey} key
     * @param {number} newPosition
     */
    movePos(obj, key, newPosition) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) {
            throw new Error('The provided key does not exist in the object.');
        }

        const keys = Object.keys(obj);

        if (newPosition < 0 || newPosition >= keys.length) {
            throw new Error('Invalid new position.');
        }

        const currentIndex = keys.indexOf(key);

        if (currentIndex === newPosition) {
            // Key is already at the desired position
            return obj;
        }

        const newKeys = [
            ...keys.slice(0, currentIndex),
            ...keys.slice(currentIndex + 1, newPosition + 1),
            key,
            ...keys.slice(newPosition + 1)
        ];

        const result = {};

        newKeys.forEach((k) => {
            result[k] = obj[k];
        });

        return result;
    }
    get obj() {
        var a = localStorage.getItem("save") ?? '';
        var oc
        try {
            oc = JSON.parse(a)
        } catch {
            return null
        }
        return oc
    }
    get words() {
        var a = localStorage.getItem("words") ?? '';
        var oc
        try {
            oc = a.split(' ')
        } catch {
            return null
        }
        return oc
    }
    get learned() {
        var a = localStorage.getItem("learned") ?? '';
        var b = localStorage.getItem('alllearned') ?? ''
        var oc
        try {
            oc = a.split(' ')
            let c = b.split(' ')
            oc = [...oc, ...c]
        } catch {
            return null
        }
        this._bin = oc
        return oc
    }
    get bin() {
        var a = localStorage.getItem("keep") ?? '';
        var oc
        try {
            oc = a.split(' ')
        } catch {
            return null
        }
        this._bin = oc
        return oc
    }
    get known() {
        var a = localStorage.getItem("known") ?? '';
        var oc
        try {
            oc = a.split(' ')
        } catch {
            return null
        }
        this._known = oc
        return oc
    }
    set bin(value) {
        if (Array.isArray(value)) {
            this._bin = value.join(' ');
            localStorage.setItem('keep', this._bin);
        } else {
            localStorage.setItem('keep', value);
        }
    }
    binFix() {
        localStorage.setItem('keep', JSON.parse(this.bin[0]).join(' '))
    }
    binSet(index, value) {
        this._bin = this.bin
        if (typeof index === 'number' && index >= 0 && index < this._array.length) {
            this._bin[index] = value;
            localStorage.setItem('bin', JSON.stringify(this._array));
        } else {
            throw new Error('Invalid index.');
        }
    }
    get arr() {
        var a = localStorage.getItem("save") ?? '';
        var oc
        try {
            oc = JSON.parse(a)
            oc = Object.values(oc)
        } catch {
            return null
        }
        return oc
    }
    async getter(key) {
        let val = null
        let i = localStorage.getItem(key)
        if (i == '[object Object]') {
            return {};
        } else {
            return i;
        }
        if (Object.hasOwn(this.vars, key)) {
            val = this.vars[key]
        } else {
            try {
                val = await this.getDb(`/${key}`)
            } catch (err) {
                console.log(err);
                try {
                    val = localStorage.getItem(key)
                } catch (error) {
                    console.error(error);
                }
            }
            this.vars[key] = val
        }
        if (val instanceof Promise) {
            return await val
        }
        return val
    }
    async setter(key, value) {
        let val = null
        try {
            localStorage.setItem(key, value)
            val = this.put(value, `/${key}`)
            this.vars[key] = val
        } catch (error) {
            console.error(error);
        }
        return val
    }
}