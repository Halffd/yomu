/* The `Analyze` class is a JavaScript class that provides methods for analyzing Japanese text,
including analyzing the text itself, generating furigana, converting to romaji, analyzing grammar,
and analyzing word frequency. */
/* globals aDict lg wn token */
import {wn} from './aUtil.js';
const lg = console.log;

const API_URL = 'http://localhost:5000'; // Replace with your API URL
const analyzeText = async (/** @type {any} */ text, mode = 'A', nominalForm = false, printFields = false) => {
    const url = `${API_URL}/analyze`;
    const payload = {
        text,
        mode,
        nominal_form: nominalForm,
        print_fields: printFields
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error('An error occurred while analyzing the text.');
    }

    const data = await response.json();
    return data;
};

const analyzeFurigana = async (/** @type {any} */ text, mode = 'A') => {
    const url = `${API_URL}/furigana`;
    const payload = {
        text,
        mode
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error('An error occurred while analyzing the furigana.');
    }

    const data = await response.json();
    return data;
};

const analyzeRomaji = async (/** @type {any} */ text, mode = 'A') => {
    const url = `${API_URL}/romaji`;
    const payload = {
        text,
        mode
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error('An error occurred while analyzing the romaji.');
    }

    const data = await response.json();
    return data;
};

const analyzeGrammar = async (/** @type {any} */ text, mode = 'A') => {
    const url = `${API_URL}/grammar`;
    const payload = {
        text,
        mode
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error('An error occurred while analyzing the grammar.');
    }

    const data = await response.json();
    return data;
};

const analyzeFrequency = async (/** @type {any} */ text, mode = 'A') => {
    const url = `${API_URL}/frequency`;
    const payload = {
        text,
        mode
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error('An error occurred while analyzing the frequency.');
    }

    const data = await response.json();
    return data;
};

export class Analyze {
    constructor(dic, t) {
        this.dic = dic
        this.dic.analyze = this
        this.t = t
        this.txt = document.createElement('textarea')
        this.btn = document.createElement('button')
        this.txt.placeholder = 'Text to Analyze'
        this.txt.addEventListener('change', this.run.bind(this), false)
        this.btn.textContent = 'All Learned'
        this.btn.onclick = async function(e){
            e.stopPropagation()
            let es = document.querySelectorAll('.vis')
            let kn = await this.dic.note.getter('alllearned') ?? ''
            kn = kn.split(' ') ?? []
            for(let elem of es){
                let ww = elem.getAttribute('w')
                let w = this.dic.unconj(elem) ?? ww
                let is = this.dic.at(w)
                let a = elem.getAttribute("fav") ?? false
                if(a) a = a == '1'
                let f = elem.classList.contains('fav');
                console.warn(`${w} is ${is} & ${f}`);
                if(!(f || a) && !is){
                    elem.classList.add('fav')
                    elem.style.border = '1px solid white'
                    kn.push(w)
                    if(ww != w){
                        kn.push(ww)
                    }
                }
            }
            console.warn(kn);
            kn = kn.join(' ')
            this.dic.note.setter('alllearned', kn)
        }.bind(this)
        t.appendChild(this.txt)
        t.appendChild(this.btn)
        this.tc = this.t.appendChild(document.createElement('div'))
    }
    async run(e = null, ta = null) {
        let txt = this.txt
        this.dic.analysis = true
        let t
        if (e) {
            e.stopPropagation();
            t = e.target.value
        }
        console.log(txt, t);
        try {
            // document.querySelector('.content-body-inner').remove()
        } catch { }
        // this.del(this.t)
        // Regular expression pattern to match Japanese katakana, hiragana, or kanji, and Chinese Han characters (excluding digits and punctuation)
        const regex = /[^\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}\n\s]/gu;
        try {
            t = t.replace(regex, '')
            console.log(t);
            let tokens = []
            if (!ta) {
                if (this.dic.lang === 'zh' && typeof Intl !== 'undefined' && Intl.Segmenter) {
                    const segmenter = new Intl.Segmenter('zh', { granularity: 'word' });
                    const segments = segmenter.segment(t);
                    let count = 0;
                    for (const segment of segments) {
                        tokens.push(segment.segment);
                        if (++count % 500 === 0) await new Promise(r => setTimeout(r, 0));
                    }
                } else {
                    // Tokenize line by line to prevent long synchronous blocks
                    const lines = t.split('\n');
                    for (const line of lines) {
                        if (line.trim()) {
                            const lineTokens = await token(line);
                            tokens.push(...lineTokens);
                        }
                        tokens.push('\n');
                        // Yield to main thread
                        await new Promise(r => setTimeout(r, 0));
                    }
                }
            } else {
                tokens = ta
            }
            var fq = {}
            lg(tokens);
            this.sts = [];
            this.ref = {};
            this.an = true;
            let st = [];
            let stJoin = '';
            const re = /--/g
            for (let i = 0; i < tokens.length; i++) {
                let word = tokens[i];
                const isLast = i === tokens.length - 1;

                st.push(word);
                stJoin += word;

                let count = (stJoin.match(re) || []).length
                let sub = stJoin.includes('--');
                if ((!sub && word.includes('\n'))
                    || (sub && count > 1)
                    || (sub && word.includes('\n\n'))
                    || isLast) {
                    const sentence = stJoin;
                    st.forEach((w) => {
                        if (!this.ref[w]) { // Only store the first sentence to save memory
                            this.ref[w] = sentence;
                        }
                    });
                    this.sts.push(sentence);
                    st = [];
                    stJoin = '';
                }
                if (i % 500 === 0) await new Promise(r => setTimeout(r, 0));
            }
            console.warn({st, ref: this.ref, sts: this.sts});
            const uniqueTokens = [...new Set(tokens)].filter(t => {
                // Filter out tokens that are purely whitespace, punctuation, numbers, or symbols
                const trimmed = t.trim();
                return trimmed.length > 0 && 
                       !/^[\d\s\-:.,]+$/.test(trimmed) &&
                       !/^[\p{P}\p{S}]+$/u.test(trimmed);
            });

            // Concurrency-limited frequency lookup
            const concurrencyLimit = 10;
            const frequencies = [];
            for (let i = 0; i < uniqueTokens.length; i += concurrencyLimit) {
                const chunk = uniqueTokens.slice(i, i + concurrencyLimit);
                const chunkResults = await Promise.all(chunk.map(t => this.getFrequency(t)));
                frequencies.push(...chunkResults);
                // Yield to keep UI responsive
                await new Promise(r => setTimeout(r, 0));
            }

            for (let i = 0; i < uniqueTokens.length; i++) {
                const f = frequencies[i];
                if (f !== null && f > 0) {
                    fq[uniqueTokens[i]] = f;
                }
            }

            let res = this.sort(fq)
            wn(fq, res)
            let ft = ''
            let ts = []
            let tcHtml = '';
            let resCount = 0;
            for (let fs of res) {
                let t = fs[0]
                let f = fs[1]
                ft += t + ' '
                ts.push(t)
                tcHtml += ` ${t}: ${f} `
                if (++resCount % 200 === 0) await new Promise(r => setTimeout(r, 0));
            }
            this.tc.innerHTML = tcHtml;
            this.dic.delete();
            localStorage.setItem("slw", true)
            localStorage.setItem("yc", false)
            localStorage.setItem("kanjis", false)
            if (this.dic.var('moe') || this.dic.var('slw')) {
                await this.dic.update(ft)
            } else {
                await this.dic.tokens(ts);
            }
            this.dic.pos = 0;
        } catch (error) {
            console.error(error);
        }
    }
async getFrequency(t){
    if (this.dic.lang === 'zh') return null;
    const [f1, f2] = await Promise.all([
        this.dic.frequency(t, this.dic.cc),
        this.dic.frequency(t)
    ]);
    const f = (f1 ?? 0) > 0 ? f1 : (f2 ?? 0);
    return f > 0 ? f : null;
}
    /**
     * @param {{ [s: string]: any; } | ArrayLike<any>} obj
     */
    sort(obj) {
        const entries = Object.entries(obj);

        entries.sort((a, b) => a[1] - b[1]);

        return entries;
    }
    /**
     * @param {{ parentElement: { children: ArrayLike<any> | Iterable<any>; }; }} txt
     */
    del(txt) {
        try {
            var elementsToDelete = Array.from(txt.parentElement.children);

            // Iterate over the elements and delete them
            elementsToDelete.forEach(function (element) {
                if (element.tagName !== 'SCRIPT' && element !== txt && !element.contains(txt)) {
                    element.parentNode.removeChild(element);
                }
            });
        } catch (error) {
            console.error(error);
        }
    }
    /**
     * @param {any} text
     */
    test(text, mode = 'A') {
        analyzeText(text, mode, true, false)
            .then(data => {
                wn('Text analysis:', data);
            })
            .catch(error => {
                console.error(error);
            });

        analyzeFurigana(text, mode)
            .then(data => {
                wn('Furigana analysis:', data);
            })
            .catch(error => {
                console.error(error);
            });

        analyzeRomaji(text, mode)
            .then(data => {
                wn('Romaji analysis:', data);
            })
            .catch(error => {
                console.error(error);
            });

        analyzeGrammar(text, mode)
            .then(data => {
                wn('Grammar analysis:', data);
            })
            .catch(error => {
                console.error(error);
            });

        analyzeFrequency(text, mode)
            .then(data => {
                wn('Frequency analysis:', data);
            })
            .catch(error => {
                console.error(error);
            });
    }
}