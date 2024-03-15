/* The `Analyze` class is a JavaScript class that provides methods for analyzing Japanese text,
including analyzing the text itself, generating furigana, converting to romaji, analyzing grammar,
and analyzing word frequency. */
/* globals aDict lg wn token */
import {wn} from './aDict.js';
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
        this.t = t
        this.txt = document.createElement('textarea')
        this.btn = document.createElement('button')
        this.txt.placeholder = 'Text to Analyze'
        this.txt.addEventListener('change', this.run.bind(this), false)
        this.btn.textContent = 'All Learned'
        this.btn.onclick = function(e){
            e.stopPropagation()
            let es = document.querySelectorAll('.vis')
            let kn = localStorage.getItem('known') ?? ''
            kn = kn.split(' ') ?? []
            for(let elem of es){
                let w = this.dic.unconj(elem) ?? elem.getAttribute('w')
                let is = this.dic.at(w)
                let f = elem.classList.contains('fav');
                console.warn(`${w} is ${is} & ${f}`);
                if(!(f && is)){
                    elem.classList.add('fav')
                    elem.style.border = '1px solid white'
                    kn.push(w)
                }
            }
            console.warn(kn);
            kn = kn.join(' ')
            localStorage.setItem('known', kn)
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
            // txt = e.target
            t = e.target.value
        }
        console.log(); (txt, t);
        try {
            // document.querySelector('.content-body-inner').remove()
        } catch { }
        // this.del(this.t)
        // Regular expression pattern to match Japanese katakana, hiragana, or kanji
        const regex = /[^\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}\n\d\-:,]/gu;
        try {
            t = t.replace(regex, '')
            console.log(t);
            let tokens = []
            if (!ta) {
                tokens = await token(t);
            } else {
                tokens = ta
            }
            var fq = {}
            lg(tokens);
            this.sts = [];
            this.ref = {};
            this.an = true;
            let st = [];
            const re = /--/g
            for (let i = 0; i < tokens.length; i++) {
                let word = tokens[i];
                if (i === tokens.length - 1) {
                    st.push(word)
                }
                let count = ((st.join('') || '').match(re) || []).length
                let sub = st.join('').includes('--');
                if ((!sub && word.includes('\n'))
                    || (sub && count > 1)
                    || (sub && word.includes('\n\n'))
                    || i === tokens.length - 1) {
                    st.forEach((w) => {
                        if (this.ref[w]) {
                            this.ref[w] += '\n' + st.join('');
                        } else {
                            this.ref[w] = st.join('');
                        }
                    });
                    this.sts.push(st.join());
                    st = [];
                } else {
                    st.push(word);
                }
            }
            console.warn({st, ref: this.ref, sts: this.sts});
            tokens = [...new Set(tokens)]

            for (let i in tokens) {
                let t = tokens[i]
                // t = await unconjugate(t)
                let f1 = await this.dic.frequency(t, this.dic.cc) ?? 0
                let f2 = await this.dic.frequency(t) ?? 0
                let f
                //if (f2 > 0 && f2 > 0) { f = Math.round((f1 + f2) / 2)
                //} else {
                f = f1 > 0 ? f1 : f2
                //}
                wn(i, t)
                fq[t] = f;
            }
            let res = this.sort(fq)
            wn(fq, res)
            let ft = ''
            let ts = []
            for (let fs of res) {
                let t = fs[0]
                let f = fs[1]
                ft += t + ' '
                ts.push(t)
                this.tc.innerHTML += ` ${t}: ${f} `
            }
            this.dic.delete();
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