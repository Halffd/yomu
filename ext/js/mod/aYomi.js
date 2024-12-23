/**
 * Retrieves dictionary entries and generates HTML with yomi kanjis.
 *
 * @param {string} y - The input string to process.
 * @returns {Promise<string>} - The generated HTML with yomi kanjis.
 */
export async function yomiKanjis(y, el = false) {
    /**
     * Regular expression to match Chinese characters.
     * @type {RegExp}
     */
    const RGEX_CHINESE = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;

    /**
     * Flag indicating if the input contains Chinese characters.
     * @type {boolean}
     */
    const iji = RGEX_CHINESE.test(y);

    /**
     * Counter for kanji entries.
     * @type {number}
     */
    let kx = 0;

    /**
     * The container element for the generated HTML.
     * @type {HTMLDivElement}
     */
    const de = document.createElement('div');
    de.insertAdjacentHTML(
        'afterbegin',
        '<div class="dd" style="border: 2px solid rgb(20,100,10)"></div><div class="df" style="border: 1px solid rgb(60,45,45)"></div>'
    );

    /**
     * The HTML string for kanji characters.
     * @type {string}
     */
    let dd = '';

    /**
     * The HTML string for kanji details.
     * @type {string}
     */
    let df = '';

    if (iji && y.length >= 1) {
        for (let i = 0; i < y.length; i++) {
            if (RGEX_CHINESE.test(y[i])) {
                dd += `<span class="kjdd" style="font-size: 1.75em">${y[i]}</span>`;
                df += `<span class="kjdf" style="font-size: 1.75em">${y[i]}</span>`;
                try {
                    const result = await this._findDictionaryEntries(true, y[i], true, this.getOptionsContext());
                    let kym = '';
                    let oym = '';

                    for (let d = 0; d < result.length; d++) {
                        if (result[d].dictionary.includes('KANJIDIC')) {
                            kx = d;
                            if (result[kx] && result[kx].kunyomi && result[kx].onyomi && result[kx].definitions) {
                                dd += `<div>Onyomi: ${result[kx].kunyomi.join(' ')}</br>Kunyomi: ${result[kx].onyomi.join(' ')}</br>${result[kx].definitions.join(', ')}</div>`;
                            }
                        } else {
                            if (result[d].kunyomi && result[d].onyomi && result[d].definitions) {
                                kym = result[d].kunyomi.length > 0 ? `Onyomi: ${result[d].kunyomi.join(' ')}</br>` : '';
                                oym = result[d].onyomi.length > 0 ? `Kunyomi: ${result[d].onyomi.join(' ')}</br>` : '';
                                df += `<div>${kym}${oym}${result[d].definitions.join(', ')}</div>`;
                            }
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }

    if (de) {
        /**
         * The container element for kanji characters.
         * @type {HTMLDivElement}
         */
        const dde = de.querySelector('.dd');

        /**
         * The container element for kanji details.
         * @type {HTMLDivElement}
         */
        const dfe = de.querySelector('.df');

        if (dde) {
            dde.innerHTML = dd;
        }
        if (dfe) {
            dfe.innerHTML = df;
        }
        df = el ? de : de.innerHTML;
    }

    return df;
}