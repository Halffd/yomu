/* eslint-disable */
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
var mod = {}; // Initialize an empty namespace object

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
 * @param {import("../language/sandbox/japanese-util").JapaneseUtil} japaneseUtil
 */
function vars(aD, displayAnki, aN, someValue, japaneseUtil) {
    aDict = aD;
    anki = displayAnki;
    aNote = aN;
    sv = someValue;
    jpu = japaneseUtil;

    // Create a namespace object and assign variables as its properties
    mod = {
        aDict: aDict,
        anki: anki,
        aNote: aNote,
        sv: sv,
        jpu: jpu
    };
    console.log(mod);
}
/**
 * @typedef {Object} kuromoji
 * @description The main namespace object for the Kuromoji library.
 */

/**
 * Initializes the tokenizer.
 * @returns {Promise<Tokenizer>} - The tokenizer instance.
 */
function initializeTokenizer() {
    return new Promise((resolve, reject) => {
        /**
         * @typedef {Object} KuromojiBuilder
         * @property {string} dicPath - The path to the dictionary files.
         * @property {function(callback: function(Error, Tokenizer)): void} build - Builds the tokenizer asynchronously.
         */

        /**
         * Builds a Kuromoji tokenizer with the specified options.
         *
         * @function
         * @name kuromoji.builder
         * @param {Object} options - The builder options.
         * @param {string} options.dicPath - The path to the dictionary files.
         * @returns {KuromojiBuilder} - The Kuromoji builder object.
         */
        kuromoji.builder({dicPath: '../../lib/dict'}).build((err, tokenizer) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(tokenizer);
        });
    });
}
/**
 * @typedef {Object} Tokenizer
 * @property {function(string): Array} tokenize - Tokenizes text.
 */

/**
 * @type {Tokenizer | Promise<void>}
 */
var tokenizer = Promise.resolve();;

/**
 * Unconjugates a word.
 * @param {string} word - The word to unconjugate.
 * @returns {Promise<string>} - The unconjugated form of the word.
 */
async function unconjugate(word) {
    try {
        if (tokenizer instanceof Promise) {
            tokenizer = await initializeTokenizer()
        }
        if (tokenizer) {
            // Use the tokenizer to analyze the specific word

            /**
             * @type {Tokenizer}
             */
            /**
                 * Tokenizes text.
                 * @param {string} text - Input text to analyze.
                 * @returns {Array} - Tokens.
                 */
            const tokens = tokenizer.tokenize(word);

            // Get the unconjugated form of the word
            let unconjugatedForm = '';
            for (let i = 0; i < tokens.length; i++) {
                const element = tokens[i].basic_form ?? tokens[i].surface_form;;
                unconjugatedForm += element;
            }

            return unconjugatedForm;
        }
        return word
    } catch (err) {
        throw err;
    }
}
/**
 * Description placeholder
 * @date 1/18/2024 - 1:57:41 AM
 *
 * @type {string}
 */
var mD = 'A'
/**
 * Description placeholder
 * @date 1/18/2024 - 1:57:41 AM
 *
 * @param {*} input_string
 * @returns {*}
 */
function modes(input_string) {
    mode_mapping = {
        "a": tokenizer.SplitMode.A,
        "b": tokenizer.SplitMode.B,
        "c": tokenizer.SplitMode.C,
    };

    mode = mode_mapping[input_string.toLowerCase()];
    mD = mode;
    return mode;
}

function convert_to_romaji(text) {
    const kakasi_inst = new kakasi();
    kakasi_inst.setMode("H", "a");
    kakasi_inst.setMode("K", "a");
    kakasi_inst.setMode("J", "a");
    const conv = kakasi_inst.getConverter();
    return conv.do(text);
}

/**
 * Description placeholder
 * @date 1/18/2024 - 1:57:41 AM
 *
 * @param {*} text
 * @returns {{}}
 */
function get_token_frequency(text) {
    const token_frequency = {};
    return token_frequency;
}

/**
 * Analyzes the text and returns token information.
 * @async
 * @param {string} text - The input text.
 * @param {string} [mode='A'] - The tokenization mode.
 * @param {boolean} [nom=false] - Whether to include the nominal form.
 * @returns {Promise<Array<Object>>} - The token analysis.
 */
async function analyse(text, mode = 'A', nom = false) {
    if (tokenizer instanceof Promise) {
        tokenizer = await initializeTokenizer()
    }
    // mode = modes(mode || "A");
    const nominal_form = nom

    const tokens = tokenizer.tokenize(text);

    const analysis = [];
    for (const token of tokens) {
        analysis.push(token_to_dict(token));
    }
    return analysis
};

/**
 * Extracts furigana for the text.
 * @async
 * @param {string} text - The input text.
 * @param {string} [mode='A'] - The tokenization mode.
 * @returns {Promise<Array<Object>>} - The furigana information.
 */
async function furigana(text, mode = 'A') {
    if (tokenizer instanceof Promise) {
        tokenizer = await initializeTokenizer()
    }
    // mode = modes(mode || "A");

    const tokens = tokenizer.tokenize(text);

    const furigana = [];
    for (const token of tokens) {
        furigana.push(token_to_dict(token, false, true));
    }

    return furigana;
};

/**
 * Extracts furigana for multiple texts.
 * @async
 * @param {Array<string>} texts - The input texts.
 * @param {string} [mode='A'] - The tokenization mode.
 * @returns {Promise<Array<Array<Object>>>} - The furigana information for each text.
 */
async function furiganas(texts, mode = 'A') {
    if (tokenizer instanceof Promise) {
        tokenizer = await initializeTokenizer()
    }
    // mode = modes(mode || "A");

    const f = [];
    for (const text of texts) {
        const tokens = tokenizer.tokenize(text);

        const furigana = [];
        for (const token of tokens) {
            const e = token_to_dict(token, false, true);
            if (e !== null) {
                furigana.push(e);
            }
        }
        f.push(furigana);
    }

    return f;
};

/**
 * Extracts furigana for multiple texts.
 * @async
 * @param {string} text - The input texts.
 * @param {string} [mode='A'] - The tokenization mode.
 * @returns {Promise<Array<string>>} - The furigana information for each text.
 */
async function token(text, mode = 'A') {
    if (tokenizer instanceof Promise) {
        tokenizer = await initializeTokenizer()
    }
    // mode = modes(mode || "A");

    const tokens = tokenizer.tokenize(text);

    const tokenArr = [];
    for (const token of tokens) {
        tokenArr.push(token_to_dict(token, true));
    }

    return tokenArr;
};

/**
 * Converts a token to a dictionary object.
 *
 * @param {*} token - The token to convert.
 * @param {boolean} [tok=false] - Whether to return the token's basic form.
 * @param {boolean} [furi=false] - Whether to include furigana.
 * @param {boolean} [dicts=false] - Whether to include additional dictionaries.
 * @param {boolean} [short=false] - Whether to use short furigana format.
 * @param {boolean} [recursive=false] - Whether to recursively tokenize the basic form.
 * @returns {*} - The converted token dictionary object, or null if an error occurs.
 */
function token_to_dict(token, tok = false, furi = false, dicts = false, short = false, romaji = false, recursive = false) {
    try {
        if (tok) {
            return token.surface_form;
        }

        const hiragana_reading = jpu.convertHiraganaToKatakana(token.reading);
        const roma = jpu.convertToRomaji(token.reading);
        const token_dict = {
            "surface": token.surface_form,
            "part_of_speech": token.pos,
            "katakana": token.reading,
            "reading": hiragana_reading,
            "dictionary_form": token.basic_form,
            "read": "",
            token,
            "romaji": roma
        };
        console.log(token_dict);

        if (!dicts) {
            let t = null;
            if (recursive) {
                const tks = tokenizer.tokenize(token.basic_form, mD);
                if (tks.length > 0) {
                    t = token_to_dict(tks[0], true);
                    token_dict["read"] = t["reading"];
                    token_dict["token"] = t;
                    token_dict["romaji"] = [roma, t["romaji"]];
                }
            }

            if (furi) {
                const kanji_pattern = /[\u4e00-\u9faf]/;
                const kanji_matches = kanji_pattern.test(token.basic_form);
                let fg;
                if (!kanji_matches) {
                    fg = null;
                } else if (short) {
                    fg = [token.basic_form, hiragana_reading];
                } else {
                    fg = [token.basic_form, hiragana_reading, t ? t["reading"] : ""];
                }
                return fg;
            }

            if (romaji) {
                return [
                    token.basic_form,
                    token_dict["romaji"],
                    hiragana_reading,
                    token_dict["reading"]
                ];
            }
            return token_dict;
        }

        return token_dict;
    } catch (error) {
        console.error("An error occurred while converting the token:", error);
        return null;
    }
}
window.mod = mod;
window.vars = vars;
window.add = add;