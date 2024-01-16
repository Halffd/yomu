/*
 * Copyright (C) 2023  Yomitan Authors
 * Copyright (C) 2021-2022  Yomichan Authors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {EventListenerCollection, deferPromise} from '../core.js';
import {AnkiNoteBuilder} from '../data/anki-note-builder.js';
import {AnkiUtil} from '../data/anki-util.js';
import {PopupMenu} from '../dom/popup-menu.js';
import {querySelectorNotNull} from '../dom/query-selector.js';
import {TemplateRendererProxy} from '../templates/template-renderer-proxy.js';
import {yomitan} from '../yomitan.js';

export class DisplayAnki {
    /**
     * @param {import('./display.js').Display} display
     * @param {import('./display-audio.js').DisplayAudio} displayAudio
     * @param {import('../language/sandbox/japanese-util.js').JapaneseUtil} japaneseUtil
     */
    constructor(display, displayAudio, japaneseUtil) {
        /** @type {import('./display.js').Display} */
        this._display = display;
        /** @type {import('./display-audio.js').DisplayAudio} */
        this._displayAudio = displayAudio;
        /** @type {?string} */
        this._ankiFieldTemplates = null;
        /** @type {?string} */
        this._ankiFieldTemplatesDefault = null;
        /** @type {AnkiNoteBuilder} */
        this._ankiNoteBuilder = new AnkiNoteBuilder(japaneseUtil, new TemplateRendererProxy());
        /** @type {?import('./display-notification.js').DisplayNotification} */
        this._errorNotification = null;
        /** @type {?EventListenerCollection} */
        this._errorNotificationEventListeners = null;
        /** @type {?import('./display-notification.js').DisplayNotification} */
        this._tagsNotification = null;
        /** @type {?Promise<void>} */
        this._updateAdderButtonsPromise = null;
        /** @type {?import('core').TokenObject} */
        this._updateDictionaryEntryDetailsToken = null;
        /** @type {EventListenerCollection} */
        this._eventListeners = new EventListenerCollection();
        /** @type {?import('display-anki').DictionaryEntryDetails[]} */
        this._dictionaryEntryDetails = null;
        /** @type {?import('anki-templates-internal').Context} */
        this._noteContext = null;
        /** @type {boolean} */
        this._checkForDuplicates = false;
        /** @type {boolean} */
        this._suspendNewCards = false;
        /** @type {boolean} */
        this._compactTags = false;
        /** @type {import('settings').ResultOutputMode} */
        this._resultOutputMode = 'split';
        /** @type {import('settings').GlossaryLayoutMode} */
        this._glossaryLayoutMode = 'default';
        /** @type {import('settings').AnkiDisplayTags} */
        this._displayTags = 'never';
        /** @type {import('settings').AnkiDuplicateScope} */
        this._duplicateScope = 'collection';
        /** @type {boolean} */
        this._duplicateScopeCheckAllModels = false;
        /** @type {import('settings').AnkiScreenshotFormat} */
        this._screenshotFormat = 'png';
        /** @type {number} */
        this._screenshotQuality = 100;
        /** @type {number} */
        this._scanLength = 10;
        /** @type {import('settings').AnkiNoteGuiMode} */
        this._noteGuiMode = 'browse';
        /** @type {?number} */
        this._audioDownloadIdleTimeout = null;
        /** @type {string[]} */
        this._noteTags = [];
        /** @type {Map<import('display-anki').CreateMode, import('settings').AnkiNoteOptions>} */
        this._modeOptions = new Map();
        /** @type {Map<import('dictionary').DictionaryEntryType, import('display-anki').CreateMode[]>} */
        this._dictionaryEntryTypeModeMap = new Map([
            ['kanji', ['kanji']],
            ['term', ['term-kanji', 'term-kana']]
        ]);
        /** @type {HTMLElement} */
        this._menuContainer = querySelectorNotNull(document, '#popup-menus');
        /** @type {(event: MouseEvent) => void} */
        this._onShowTagsBind = this._onShowTags.bind(this);
        /** @type {(event: MouseEvent) => void} */
        this._onNoteAddBind = this._onNoteAdd.bind(this);
        /** @type {(event: MouseEvent) => void} */
        this._onViewNoteButtonClickBind = this._onViewNoteButtonClick.bind(this);
        /** @type {(event: MouseEvent) => void} */
        this._onViewNoteButtonContextMenuBind = this._onViewNoteButtonContextMenu.bind(this);
        /** @type {(event: import('popup-menu').MenuCloseEvent) => void} */
        this._onViewNoteButtonMenuCloseBind = this._onViewNoteButtonMenuClose.bind(this);
    }

    /** */
    prepare() {
        this._noteContext = this._getNoteContext();
        /* eslint-disable no-multi-spaces */
        this._display.hotkeyHandler.registerActions([
            ['addNoteKanji', () => { this._tryAddAnkiNoteForSelectedEntry('kanji'); }],
            ['addNoteTermKanji', () => { this._tryAddAnkiNoteForSelectedEntry('term-kanji'); }],
            ['addNoteTermKana', () => { this._tryAddAnkiNoteForSelectedEntry('term-kana'); }],
            ['viewNote', this._viewNoteForSelectedEntry.bind(this)]
        ]);
        /* eslint-enable no-multi-spaces */
        this._display.on('optionsUpdated', this._onOptionsUpdated.bind(this));
        this._display.on('contentClear', this._onContentClear.bind(this));
        this._display.on('contentUpdateStart', this._onContentUpdateStart.bind(this));
        this._display.on('contentUpdateEntry', this._onContentUpdateEntry.bind(this));
        this._display.on('contentUpdateComplete', this._onContentUpdateComplete.bind(this));
        this._display.on('logDictionaryEntryData', this._onLogDictionaryEntryData.bind(this));
    }

    /**
     * @param {import('dictionary').DictionaryEntry} dictionaryEntry
     * @returns {Promise<import('display-anki').LogData>}
     */
    async getLogData(dictionaryEntry) {
        // Anki note data
        let ankiNoteData;
        let ankiNoteDataException;
        try {
            if (this._noteContext === null) { throw new Error('Note context not initialized'); }
            ankiNoteData = await this._ankiNoteBuilder.getRenderingData({
                dictionaryEntry,
                mode: 'test',
                context: this._noteContext,
                resultOutputMode: this._resultOutputMode,
                glossaryLayoutMode: this._glossaryLayoutMode,
                compactTags: this._compactTags,
                marker: 'test'
            });
        } catch (e) {
            ankiNoteDataException = e;
        }

        // Anki notes
        /** @type {import('display-anki').AnkiNoteLogData[]} */
        const ankiNotes = [];
        const modes = this._getModes(dictionaryEntry.type === 'term');
        for (const mode of modes) {
            let note;
            let errors;
            let requirements;
            try {
                ({note: note, errors, requirements} = await this._createNote(dictionaryEntry, mode, []));
            } catch (e) {
                errors = [e instanceof Error ? e : new Error(`${e}`)];
            }
            /** @type {import('display-anki').AnkiNoteLogData} */
            const entry = {mode, note};
            if (Array.isArray(errors) && errors.length > 0) {
                entry.errors = errors;
            }
            if (Array.isArray(requirements) && requirements.length > 0) {
                entry.requirements = requirements;
            }
            ankiNotes.push(entry);
        }

        return {
            ankiNoteData,
            ankiNoteDataException: ankiNoteDataException instanceof Error ? ankiNoteDataException : new Error(`${ankiNoteDataException}`),
            ankiNotes
        };
    }

    // Private

    /**
     * @param {import('display').EventArgument<'optionsUpdated'>} details
     */
    _onOptionsUpdated({options}) {
        const {
            general: {resultOutputMode, glossaryLayoutMode, compactTags},
            anki: {
                tags,
                duplicateScope,
                duplicateScopeCheckAllModels,
                suspendNewCards,
                checkForDuplicates,
                displayTags,
                kanji,
                terms,
                noteGuiMode,
                screenshot: {format, quality},
                downloadTimeout
            },
            scanning: {length: scanLength}
        } = options;

        this._checkForDuplicates = checkForDuplicates;
        this._suspendNewCards = suspendNewCards;
        this._compactTags = compactTags;
        this._resultOutputMode = resultOutputMode;
        this._glossaryLayoutMode = glossaryLayoutMode;
        this._displayTags = displayTags;
        this._duplicateScope = duplicateScope;
        this._duplicateScopeCheckAllModels = duplicateScopeCheckAllModels;
        this._screenshotFormat = format;
        this._screenshotQuality = quality;
        this._scanLength = scanLength;
        this._noteGuiMode = noteGuiMode;
        this._noteTags = [...tags];
        this._audioDownloadIdleTimeout = (Number.isFinite(downloadTimeout) && downloadTimeout > 0 ? downloadTimeout : null);
        this._modeOptions.clear();
        this._modeOptions.set('kanji', kanji);
        this._modeOptions.set('term-kanji', terms);
        this._modeOptions.set('term-kana', terms);

        this._updateAnkiFieldTemplates(options);
    }

    /** */
    _onContentClear() {
        this._updateDictionaryEntryDetailsToken = null;
        this._dictionaryEntryDetails = null;
        this._hideErrorNotification(false);
    }

    /** */
    _onContentUpdateStart() {
        this._noteContext = this._getNoteContext();
    }

    /**
     * @param {import('display').EventArgument<'contentUpdateEntry'>} details
     */
    _onContentUpdateEntry({element}) {
        const eventListeners = this._eventListeners;
        for (const node of element.querySelectorAll('.action-button[data-action=view-tags]')) {
            eventListeners.addEventListener(node, 'click', this._onShowTagsBind);
        }
        for (const node of element.querySelectorAll('.action-button[data-action=add-note]')) {
            eventListeners.addEventListener(node, 'click', this._onNoteAddBind);
        }
        for (const node of element.querySelectorAll('.action-button[data-action=view-note]')) {
            eventListeners.addEventListener(node, 'click', this._onViewNoteButtonClickBind);
            eventListeners.addEventListener(node, 'contextmenu', this._onViewNoteButtonContextMenuBind);
            eventListeners.addEventListener(node, 'menuClose', this._onViewNoteButtonMenuCloseBind);
        }
    }

    /** */
    _onContentUpdateComplete() {
        this._updateDictionaryEntryDetails();
    }

    /**
     * @param {import('display').EventArgument<'logDictionaryEntryData'>} details
     */
    _onLogDictionaryEntryData({dictionaryEntry, promises}) {
        promises.push(this.getLogData(dictionaryEntry));
    }

    /**
     * @param {MouseEvent} e
     */
    _onNoteAdd(e) {
        e.preventDefault();
        const element = /** @type {HTMLElement} */ (e.currentTarget);
        const mode = this._getValidCreateMode(element.dataset.mode);
        if (mode === null) { return; }
        const index = this._display.getElementDictionaryEntryIndex(element);
        this._addAnkiNote(index, mode);
    }

    /**
     * @param {MouseEvent} e
     */
    _onShowTags(e) {
        e.preventDefault();
        const element = /** @type {HTMLElement} */ (e.currentTarget);
        const tags = element.title;
        this._showTagsNotification(tags);
    }

    /**
     * @param {number} index
     * @param {import('display-anki').CreateMode} mode
     * @returns {?HTMLButtonElement}
     */
    _adderButtonFind(index, mode) {
        const entry = this._getEntry(index);
        return entry !== null ? entry.querySelector(`.action-button[data-action=add-note][data-mode="${mode}"]`) : null;
    }

    /**
     * @param {number} index
     * @returns {?HTMLButtonElement}
     */
    _tagsIndicatorFind(index) {
        const entry = this._getEntry(index);
        return entry !== null ? entry.querySelector('.action-button[data-action=view-tags]') : null;
    }

    /**
     * @param {number} index
     * @returns {?HTMLElement}
     */
    _getEntry(index) {
        const entries = this._display.dictionaryEntryNodes;
        return index >= 0 && index < entries.length ? entries[index] : null;
    }

    /**
     * @returns {?import('anki-templates-internal').Context}
     */
    _getNoteContext() {
        const {state} = this._display.history;
        let documentTitle, url, sentence;
        if (typeof state === 'object' && state !== null) {
            ({documentTitle, url, sentence} = state);
        }
        if (typeof documentTitle !== 'string') {
            documentTitle = document.title;
        }
        if (typeof url !== 'string') {
            url = window.location.href;
        }
        const {query, fullQuery, queryOffset} = this._display;
        sentence = this._getValidSentenceData(sentence, fullQuery, queryOffset);
        return {
            url,
            sentence,
            documentTitle,
            query,
            fullQuery
        };
    }

    /** */
    async _updateDictionaryEntryDetails() {
        const {dictionaryEntries} = this._display;
        /** @type {?import('core').TokenObject} */
        const token = {};
        this._updateDictionaryEntryDetailsToken = token;
        if (this._updateAdderButtonsPromise !== null) {
            await this._updateAdderButtonsPromise;
        }
        if (this._updateDictionaryEntryDetailsToken !== token) { return; }

        const {promise, resolve} = /** @type {import('core').DeferredPromiseDetails<void>} */ (deferPromise());
        try {
            this._updateAdderButtonsPromise = promise;
            const dictionaryEntryDetails = await this._getDictionaryEntryDetails(dictionaryEntries);
            if (this._updateDictionaryEntryDetailsToken !== token) { return; }
            this._dictionaryEntryDetails = dictionaryEntryDetails;
            this._updateAdderButtons(dictionaryEntryDetails);
        } finally {
            resolve();
            if (this._updateAdderButtonsPromise === promise) {
                this._updateAdderButtonsPromise = null;
            }
        }
    }

    /**
     * @param {import('display-anki').DictionaryEntryDetails[]} dictionaryEntryDetails
     */
    _updateAdderButtons(dictionaryEntryDetails) {
        const displayTags = this._displayTags;
        for (let i = 0, ii = dictionaryEntryDetails.length; i < ii; ++i) {
            let allNoteIds = null;
            for (const {mode, canAdd, noteIds, noteInfos, ankiError} of dictionaryEntryDetails[i].modeMap.values()) {
                const button = this._adderButtonFind(i, mode);
                if (button !== null) {
                    button.disabled = !canAdd;
                    button.hidden = (ankiError !== null);
                }

                if (Array.isArray(noteIds) && noteIds.length > 0) {
                    if (allNoteIds === null) { allNoteIds = new Set(); }
                    for (const noteId of noteIds) { allNoteIds.add(noteId); }
                }

                if (displayTags !== 'never' && Array.isArray(noteInfos)) {
                    this._setupTagsIndicator(i, noteInfos);
                }
            }
            this._updateViewNoteButton(i, allNoteIds !== null ? [...allNoteIds] : [], false);
        }
    }

    /**
     * @param {number} i
     * @param {(?import('anki').NoteInfo)[]} noteInfos
     */
    _setupTagsIndicator(i, noteInfos) {
        const tagsIndicator = this._tagsIndicatorFind(i);
        if (tagsIndicator === null) {
            return;
        }

        const displayTags = new Set();
        for (const item of noteInfos) {
            if (item === null) { continue; }
            for (const tag of item.tags) {
                displayTags.add(tag);
            }
        }
        if (this._displayTags === 'non-standard') {
            for (const tag of this._noteTags) {
                displayTags.delete(tag);
            }
        }

        if (displayTags.size > 0) {
            tagsIndicator.disabled = false;
            tagsIndicator.hidden = false;
            tagsIndicator.title = `Card tags: ${[...displayTags].join(', ')}`;
        }
    }

    /**
     * @param {string} message
     */
    _showTagsNotification(message) {
        if (this._tagsNotification === null) {
            this._tagsNotification = this._display.createNotification(true);
        }

        this._tagsNotification.setContent(message);
        this._tagsNotification.open();
    }

    /**
     * @param {import('display-anki').CreateMode} mode
     */
    _tryAddAnkiNoteForSelectedEntry(mode) {
        const index = this._display.selectedIndex;
        this._addAnkiNote(index, mode);
    }

    /**
     * Add an Anki note.
     * @param {number | import('dictionary').DictionaryEntry} dictionaryEntryIndex The index of the dictionary entry.
     * @param {import('display-anki').CreateMode} mode The create mode for the Anki note.
     * @param {number} [dict=-1] Optional dictionary value (default: -1).
     * @param {any[] | null} [req=null] Optional array of requirements or null (default: null).
     * @param {{ st: string } | null} [o=null] Optional object with an 'st' property or null (default: null).
     * @returns {Promise<void>} - A promise that resolves when the Anki note is added.
     */
    async _addAnkiNote(dictionaryEntryIndex, mode, dict = -1, req = null, o = null) {
        let dictionaryEntries;
        let dictionaryEntryDetails;
        let dictionaryEntry;
        let details;
        let requirements;
        let button;
        let allErrors = [];
        let progressIndicatorVisible;
        let overrideToken;

        try {
            if (dict >= 0) {
                // Handle the case when dict is greater than or equal to 0
                dictionaryEntry = dictionaryEntryIndex;
                requirements = req;
            } else if (typeof dictionaryEntryIndex === 'number') {
                dictionaryEntries = this._display.dictionaryEntries;
                dictionaryEntryDetails = this._dictionaryEntryDetails;
                if (!(
                    dictionaryEntryDetails !== null &&
                    dictionaryEntryIndex >= 0 &&
                    dictionaryEntryIndex < dictionaryEntries.length &&
                    dictionaryEntryIndex < dictionaryEntryDetails.length
                )) {
                    return;
                }
                dictionaryEntry = dictionaryEntries[dictionaryEntryIndex];
                details = dictionaryEntryDetails[dictionaryEntryIndex].modeMap.get(mode);
                if (typeof details === 'undefined') { return; }

                ({requirements} = details);

                button = this._adderButtonFind(dictionaryEntryIndex, mode);
                if (button === null || button.disabled) { return; }

                this._hideErrorNotification(true);

                /** @type {Error[]} */
                allErrors = [];
                progressIndicatorVisible = this._display.progressIndicatorVisible;
                overrideToken = progressIndicatorVisible.setOverride(true);
            }
        } catch (error) {
            console.error(error);
        }
        try {
            if (typeof dictionaryEntry === 'object' && requirements) {
                const {note, errors, requirements: outputRequirements} = await this._createNote(dictionaryEntry, mode, requirements);
                allErrors.push(...errors);
                if (requirements) {
                    const error = this._getAddNoteRequirementsError(requirements, outputRequirements);
                    if (error !== null) { allErrors.push(error); }
                }
                let noteId = null;
                let addNoteOkay = false;
                try {
                    try {
                        const typ = dict >= 0 ? 'Search' : 'Popup';
                        const [t1, t2, t3, t4] = ['aDict', `v0.1-${new Date().toISOString().slice(0, 7)}`, `in${typ}`, mode == 'term-kana' ? 'kanaMode' : 'termMode'];
                        note.tags.push(t1, t2, t3, t4);
                        console.dir(note);
                        const vrs = [note, [this, dict, dictionaryEntry, dictionaryEntries, dictionaryEntryDetails, dictionaryEntryIndex, details, requirements, mode, button, progressIndicatorVisible, overrideToken]];
                        // vrs.push(JSON.stringify(vrs))
                        console.dir(vrs);
                        // const x = this._display._container;
                        // x.style.display = "none";
                        // console.log(note.fields['Key']);
                        let run = true;
                        if (document.URL.includes('search.html') && document.URL.includes('chrome-extension')) {
                            run = localStorage.getItem('run') === 'true' ? true : false ?? true;
                        }
                        // console.log(run, document.URL);
                        if (dict < 0 && (!run || !(document.URL.includes('search.html') && document.URL.includes('chrome-extension')))) {
                            note.fields.ExtraDefinitions += this.getText();
                            // this._display._copyText(note.fields['Key']);
                        }
                        if (o) {
                            note.fields.Sentence = o.st;
                        }
                        const y = note.fields.Key;
                        const RGEX_CHINESE = new RegExp(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/);
                        const iji = RGEX_CHINESE.test(y);
                        let kx = 0;
                        const de = document.createElement('div');
                        de.insertAdjacentHTML('afterbegin', '<div class="dd" style="border: 2px solid rgb(20,100,10)"></div><div class="df" style="border: 1px solid rgb(60,45,45)"></div>');
                        let dd = '';
                        let df = '';
                        if (iji && y.length >= 1) {
                            for (const i in y.split('')) {
                                if (RGEX_CHINESE.test(y[i])) {
                                    dd += `<span style="font-size: 1.75em">${y[i]}</span>`;
                                    df += `<span style="font-size: 1.75em">${y[i]}</span>`;
                                    const result = await this._display._findDictionaryEntries(true, y[i], true, this._display.getOptionsContext());
                                    console.dir(result);
                                    let kym = '';
                                    let oym = '';
                                    for (const d in result) {
                                        if (result[d].dictionary.includes('KANJIDIC')) {
                                            kx = d;
                                            try {
                                                dd += `<div>Onyomi: ${result[kx].kunyomi.join(' ')}</br>Kunyomi: ${result[kx].onyomi.join(' ')}</br>${result[kx].definitions.join(', ')}</div>`;
                                            } catch (error) {
                                                console.log(error);
                                            }
                                        } else {
                                            try {
                                                kym = result[d].kunyomi.length > 0 ? `Onyomi: ${result[d].kunyomi.join(' ')}</br>` : '';
                                                oym = result[d].onyomi.length > 0 ? `Kunyomi: ${result[d].onyomi.join(' ')}</br>` : '';
                                                df += `<div>${kym}${oym}${result[d].definitions.join(', ')}</div>`;
                                            } catch (error) {
                                                console.log(error);
                                            }
                                        }
                                    }
                                    // elem.querySelector('dd').innerHTML += `<li>${o}</li>`
                                }
                            }
                        }
                        if (de) {
                            const [dde, dfe] = [de.querySelector('.dd'), de.querySelector('.df')];
                            if (dde) {
                                dde.innerHTML = dd;
                            }
                            if (dfe) {
                                dfe.innerHTML = df;
                            }
                            df = de.innerHTML;
                            note.fields.ExtraDefinitions += df;
                        }
                        // this._display._copyHostSelection()
                    } catch (noe) {
                        console.warn(noe);
                    }
                    try {
                        noteId = await yomitan.api.addAnkiNote(note);
                        addNoteOkay = true;
                    } catch (rr) {
                        console.error(rr, note);
                    }
                    if (noteId == undefined) {
                        this._addAnkiNote(dictionaryEntryIndex, 'term-kana', dict, req);
                        return;
                    }
                    try {
                        const response = await fetch('sound.txt');
                        const text = await response.text();
                        const base64AudioData = text.trim(); // Assuming the Base64 string is the entire content of the file

                        // Use the base64Data as needed
                        // Convert the Base64 data to ArrayBuffer
                        const binaryAudioData = window.atob(base64AudioData);
                        const arrayBuffer = new ArrayBuffer(binaryAudioData.length);
                        const view = new Uint8Array(arrayBuffer);
                        for (let i = 0; i < binaryAudioData.length; i++) {
                            view[i] = binaryAudioData.charCodeAt(i);
                        }
                        // Create an audio context
                        const audioContext = new AudioContext();
                        // Decode the audio data
                        audioContext.decodeAudioData(arrayBuffer)
                            .then(function(decodedData) {
                                // Create an audio buffer source
                                const audioSource = audioContext.createBufferSource();

                                // Set the audio buffer
                                audioSource.buffer = decodedData;

                                // Connect the audio source to the audio context destination
                                audioSource.connect(audioContext.destination);

                                // Start playing the audio
                                audioSource.start();
                            })
                            .catch(function(error) {
                                console.error('Error decoding audio data:', error);
                            });
                    } catch (error) {
                        console.error('Error reading file:', error);
                    }
                } catch (e) {
                    allErrors.length = 0;
                    allErrors.push(e instanceof Error ? e : new Error(`${e}`));
                }

                if (addNoteOkay) {
                    if (noteId === null) {
                        allErrors.push(new Error('Note could not be added'));
                    } else {
                        if (this._suspendNewCards) {
                            try {
                                await yomitan.api.suspendAnkiCardsForNote(noteId);
                            } catch (e) {
                                allErrors.push(e instanceof Error ? e : new Error(`${e}`));
                            }
                        }
                        if (button && dict < 0) { button.disabled = true; }
                        if (typeof dictionaryEntryIndex === 'number') { this._updateViewNoteButton(dictionaryEntryIndex, [noteId], true); }
                    }
                }
            }
        } catch (e) {
            allErrors.push(e instanceof Error ? e : new Error(`${e}`));
            console.error(allErrors);
        } finally {
            if (overrideToken && progressIndicatorVisible && dict < 0) {
                progressIndicatorVisible.clearOverride(overrideToken);
            }
        }

        if (allErrors.length > 0) {
            this._showErrorNotification(allErrors);
        } else {
            this._hideErrorNotification(true);
        }
    }

    /**
     * @param {import('anki-note-builder').Requirement[]} requirements
     * @param {import('anki-note-builder').Requirement[]} outputRequirements
     * @returns {?DisplayAnkiError}
     */
    _getAddNoteRequirementsError(requirements, outputRequirements) {
        if (outputRequirements.length === 0) { return null; }

        let count = 0;
        for (const requirement of outputRequirements) {
            const {type} = requirement;
            switch (type) {
                case 'audio':
                case 'clipboardImage':
                    break;
                default:
                    ++count;
                    break;
            }
        }
        if (count === 0) { return null; }

        const error = new DisplayAnkiError('The created card may not have some content');
        error.requirements = requirements;
        error.outputRequirements = outputRequirements;
        return error;
    }

    /**
     * @param {Error[]} errors
     * @param {(DocumentFragment|Node|Error)[]} [displayErrors]
     */
    _showErrorNotification(errors, displayErrors) {
        if (typeof displayErrors === 'undefined') { displayErrors = errors; }

        if (this._errorNotificationEventListeners !== null) {
            this._errorNotificationEventListeners.removeAllEventListeners();
        }

        if (this._errorNotification === null) {
            this._errorNotification = this._display.createNotification(false);
            this._errorNotificationEventListeners = new EventListenerCollection();
        }

        const content = this._display.displayGenerator.createAnkiNoteErrorsNotificationContent(displayErrors);
        for (const node of content.querySelectorAll('.anki-note-error-log-link')) {
            /** @type {EventListenerCollection} */ (this._errorNotificationEventListeners).addEventListener(node, 'click', () => {
            // eslint-disable-next-line no-console
                console.log({ankiNoteErrors: errors});
            }, false);
        }

        this._errorNotification.setContent(content);
        this._errorNotification.open();
    }

    /**
     * @param {boolean} animate
     */
    _hideErrorNotification(animate) {
        if (this._errorNotification === null) { return; }
        this._errorNotification.close(animate);
        /** @type {EventListenerCollection} */ (this._errorNotificationEventListeners).removeAllEventListeners();
    }

    /**
     * @param {import('settings').ProfileOptions} options
     */
    async _updateAnkiFieldTemplates(options) {
        this._ankiFieldTemplates = await this._getAnkiFieldTemplates(options);
    }

    /**
     * @param {import('settings').ProfileOptions} options
     * @returns {Promise<string>}
     */
    async _getAnkiFieldTemplates(options) {
        let templates = options.anki.fieldTemplates;
        if (typeof templates === 'string') { return templates; }

        templates = this._ankiFieldTemplatesDefault;
        if (typeof templates === 'string') { return templates; }

        templates = await yomitan.api.getDefaultAnkiFieldTemplates();
        this._ankiFieldTemplatesDefault = templates;
        return templates;
    }

    /**
     * @param {import('dictionary').DictionaryEntry[]} dictionaryEntries
     * @returns {Promise<import('display-anki').DictionaryEntryDetails[]>}
     */
    async _getDictionaryEntryDetails(dictionaryEntries) {
        const forceCanAddValue = (this._checkForDuplicates ? null : true);
        const fetchAdditionalInfo = (this._displayTags !== 'never');

        const notePromises = [];
        const noteTargets = [];
        for (let i = 0, ii = dictionaryEntries.length; i < ii; ++i) {
            const dictionaryEntry = dictionaryEntries[i];
            const {type} = dictionaryEntry;
            const modes = this._dictionaryEntryTypeModeMap.get(type);
            if (typeof modes === 'undefined') { continue; }
            for (const mode of modes) {
                const notePromise = this._createNote(dictionaryEntry, mode, []);
                notePromises.push(notePromise);
                noteTargets.push({index: i, mode});
            }
        }

        const noteInfoList = await Promise.all(notePromises);
        const notes = noteInfoList.map(({note}) => note);

        let infos;
        let ankiError = null;
        try {
            if (forceCanAddValue !== null) {
                if (!await yomitan.api.isAnkiConnected()) {
                    throw new Error('Anki not connected');
                }
                infos = this._getAnkiNoteInfoForceValue(notes, forceCanAddValue);
            } else {
                infos = await yomitan.api.getAnkiNoteInfo(notes, fetchAdditionalInfo);
            }
        } catch (e) {
            infos = this._getAnkiNoteInfoForceValue(notes, false);
            ankiError = e instanceof Error ? e : new Error(`${e}`);
        }

        /** @type {import('display-anki').DictionaryEntryDetails[]} */
        const results = [];
        for (let i = 0, ii = dictionaryEntries.length; i < ii; ++i) {
            results.push({
                modeMap: new Map()
            });
        }

        for (let i = 0, ii = noteInfoList.length; i < ii; ++i) {
            const {note, errors, requirements} = noteInfoList[i];
            const {canAdd, valid, noteIds, noteInfos} = infos[i];
            const {mode, index} = noteTargets[i];
            results[index].modeMap.set(mode, {mode, note, errors, requirements, canAdd, valid, noteIds, noteInfos, ankiError});
        }
        return results;
    }

    /**
     * @param {import('anki').Note[]} notes
     * @param {boolean} canAdd
     * @returns {import('anki').NoteInfoWrapper[]}
     */
    _getAnkiNoteInfoForceValue(notes, canAdd) {
        const results = [];
        for (const note of notes) {
            const valid = AnkiUtil.isNoteDataValid(note);
            results.push({canAdd, valid, noteIds: null});
        }
        return results;
    }
    /**
     * Retrieves the text from the clipboard.
     * @returns {Promise<string>} A promise that resolves to the text from the clipboard.
     */
    async getText() {
        try {
            const clipboardText = await navigator.clipboard.readText();
            return clipboardText;
        } catch (error) {
            console.error('Failed to read text from clipboard:', error);
            return ''; // Return an empty string or handle the error as needed
        }
    }

    /**
     * @param {import('dictionary').DictionaryEntry} dictionaryEntry
     * @param {import('display-anki').CreateMode} mode
     * @param {import('anki-note-builder').Requirement[]} requirements
     * @returns {Promise<import('display-anki').CreateNoteResult>}
     */
    async _createNote(dictionaryEntry, mode, requirements) {
        const context = this._noteContext;
        if (context === null) { throw new Error('Note context not initialized'); }
        const modeOptions = this._modeOptions.get(mode);
        if (typeof modeOptions === 'undefined') { throw new Error(`Unsupported note type: ${mode}`); }
        const template = this._ankiFieldTemplates;
        if (typeof template !== 'string') { throw new Error('Invalid template'); }
        const {deck: deckName, model: modelName} = modeOptions;
        const fields = Object.entries(modeOptions.fields);
        const contentOrigin = this._display.getContentOrigin();
        const details = this._ankiNoteBuilder.getDictionaryEntryDetailsForNote(dictionaryEntry);
        const audioDetails = this._getAnkiNoteMediaAudioDetails(details);
        const optionsContext = this._display.getOptionsContext();

        const {note, errors, requirements: outputRequirements} = await this._ankiNoteBuilder.createNote({
            dictionaryEntry,
            mode,
            context,
            template,
            deckName,
            modelName,
            fields,
            tags: this._noteTags,
            checkForDuplicates: this._checkForDuplicates,
            duplicateScope: this._duplicateScope,
            duplicateScopeCheckAllModels: this._duplicateScopeCheckAllModels,
            resultOutputMode: this._resultOutputMode,
            glossaryLayoutMode: this._glossaryLayoutMode,
            compactTags: this._compactTags,
            mediaOptions: {
                audio: audioDetails,
                screenshot: {
                    format: this._screenshotFormat,
                    quality: this._screenshotQuality,
                    contentOrigin
                },
                textParsing: {
                    optionsContext,
                    scanLength: this._scanLength
                }
            },
            requirements
        });
        return {note, errors, requirements: outputRequirements};
    }

    /**
     * @param {boolean} isTerms
     * @returns {import('display-anki').CreateMode[]}
     */
    _getModes(isTerms) {
        return isTerms ? ['term-kanji', 'term-kana'] : ['kanji'];
    }

    /**
     * @param {unknown} sentence
     * @param {string} fallback
     * @param {number} fallbackOffset
     * @returns {import('anki-templates-internal').ContextSentence}
     */
    _getValidSentenceData(sentence, fallback, fallbackOffset) {
        let text;
        let offset;
        if (typeof sentence === 'object' && sentence !== null) {
            ({text, offset} = /** @type {import('core').UnknownObject} */ (sentence));
        }
        if (typeof text !== 'string') {
            text = fallback;
            offset = fallbackOffset;
        } else {
            if (typeof offset !== 'number') { offset = 0; }
        }
        return {text, offset};
    }

    /**
     * @param {import('api').InjectAnkiNoteMediaDefinitionDetails} details
     * @returns {?import('anki-note-builder').AudioMediaOptions}
     */
    _getAnkiNoteMediaAudioDetails(details) {
        if (details.type !== 'term') { return null; }
        const {sources, preferredAudioIndex} = this._displayAudio.getAnkiNoteMediaAudioDetails(details.term, details.reading);
        return {sources, preferredAudioIndex, idleTimeout: this._audioDownloadIdleTimeout};
    }

    // View note functions

    /**
     * @param {MouseEvent} e
     */
    _onViewNoteButtonClick(e) {
        const element = /** @type {HTMLElement} */ (e.currentTarget);
        e.preventDefault();
        if (e.shiftKey) {
            this._showViewNoteMenu(element);
        } else {
            this._viewNote(element);
        }
    }

    /**
     * @param {MouseEvent} e
     */
    _onViewNoteButtonContextMenu(e) {
        const element = /** @type {HTMLElement} */ (e.currentTarget);
        e.preventDefault();
        this._showViewNoteMenu(element);
    }

    /**
     * @param {import('popup-menu').MenuCloseEvent} e
     */
    _onViewNoteButtonMenuClose(e) {
        const {detail: {action, item}} = e;
        switch (action) {
            case 'viewNote':
                if (item !== null) {
                    this._viewNote(item);
                }
                break;
        }
    }

    /**
     * @param {number} index
     * @param {number[]} noteIds
     * @param {boolean} prepend
     */
    _updateViewNoteButton(index, noteIds, prepend) {
        const button = this._getViewNoteButton(index);
        if (button === null) { return; }
        /** @type {(number|string)[]} */
        let allNoteIds = noteIds;
        if (prepend) {
            const currentNoteIds = button.dataset.noteIds;
            if (typeof currentNoteIds === 'string' && currentNoteIds.length > 0) {
                allNoteIds = [...allNoteIds, ...currentNoteIds.split(' ')];
            }
        }
        const disabled = (allNoteIds.length === 0);
        button.disabled = disabled;
        button.hidden = disabled;
        button.dataset.noteIds = allNoteIds.join(' ');

        /** @type {?HTMLElement} */
        const badge = button.querySelector('.action-button-badge');
        if (badge !== null) {
            const badgeData = badge.dataset;
            if (allNoteIds.length > 1) {
                badgeData.icon = 'plus-thick';
                badge.hidden = false;
            } else {
                delete badgeData.icon;
                badge.hidden = true;
            }
        }
    }

    /**
     * @param {HTMLElement} node
     */
    async _viewNote(node) {
        const noteIds = this._getNodeNoteIds(node);
        if (noteIds.length === 0) { return; }
        try {
            await yomitan.api.noteView(noteIds[0], this._noteGuiMode, false);
        } catch (e) {
            const displayErrors = (
                e instanceof Error && e.message === 'Mode not supported' ?
                    [this._display.displayGenerator.instantiateTemplateFragment('footer-notification-anki-view-note-error')] :
                    void 0
            );
            this._showErrorNotification([e instanceof Error ? e : new Error(`${e}`)], displayErrors);
            return;
        }
    }

    /**
     * @param {HTMLElement} node
     */
    _showViewNoteMenu(node) {
        const noteIds = this._getNodeNoteIds(node);
        if (noteIds.length === 0) { return; }

        /** @type {HTMLElement} */
        const menuContainerNode = this._display.displayGenerator.instantiateTemplate('view-note-button-popup-menu');
        /** @type {HTMLElement} */
        const menuBodyNode = querySelectorNotNull(menuContainerNode, '.popup-menu-body');

        for (let i = 0, ii = noteIds.length; i < ii; ++i) {
            const noteId = noteIds[i];
            /** @type {HTMLElement} */
            const item = this._display.displayGenerator.instantiateTemplate('view-note-button-popup-menu-item');
            /** @type {Element} */
            const label = querySelectorNotNull(item, '.popup-menu-item-label');
            label.textContent = `Note ${i + 1}: ${noteId}`;
            item.dataset.menuAction = 'viewNote';
            item.dataset.noteIds = `${noteId}`;
            menuBodyNode.appendChild(item);
        }

        this._menuContainer.appendChild(menuContainerNode);
        const popupMenu = new PopupMenu(node, menuContainerNode);
        popupMenu.prepare();
    }

    /**
     * @param {HTMLElement} node
     * @returns {number[]}
     */
    _getNodeNoteIds(node) {
        const {noteIds} = node.dataset;
        const results = [];
        if (typeof noteIds === 'string' && noteIds.length > 0) {
            for (const noteId of noteIds.split(' ')) {
                const noteIdInt = Number.parseInt(noteId, 10);
                if (Number.isFinite(noteIdInt)) {
                    results.push(noteIdInt);
                }
            }
        }
        return results;
    }

    /**
     * @param {number} index
     * @returns {?HTMLButtonElement}
     */
    _getViewNoteButton(index) {
        const entry = this._getEntry(index);
        return entry !== null ? entry.querySelector('.action-button[data-action=view-note]') : null;
    }

    /** */
    _viewNoteForSelectedEntry() {
        const index = this._display.selectedIndex;
        const button = this._getViewNoteButton(index);
        if (button !== null) {
            this._viewNote(button);
        }
    }

    /**
     * @param {string|undefined} value
     * @returns {?import('display-anki').CreateMode}
     */
    _getValidCreateMode(value) {
        switch (value) {
            case 'kanji':
            case 'term-kanji':
            case 'term-kana':
                return value;
            default:
                return null;
        }
    }
}

class DisplayAnkiError extends Error {
    /**
     * @param {string} message
     */
    constructor(message) {
        super(message);
        /** @type {?import('anki-note-builder').Requirement[]} */
        this._requirements = null;
        /** @type {?import('anki-note-builder').Requirement[]} */
        this._outputRequirements = null;
    }

    /** @type {?import('anki-note-builder').Requirement[]} */
    get requirements() { return this._requirements; }
    set requirements(value) { this._requirements = value; }

    /** @type {?import('anki-note-builder').Requirement[]} */
    get outputRequirements() { return this._outputRequirements; }
    set outputRequirements(value) { this._outputRequirements = value; }
}