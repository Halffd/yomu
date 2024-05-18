/*
 * Copyright (C) 2023-2024  Yomitan Authors
 * Copyright (C) 2019-2022  Yomichan Authors
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

import {Application} from '../application.js';
import {Mecab} from '../comm/mecab.js';
import {DocumentFocusController} from '../dom/document-focus-controller.js';
import {HotkeyHandler} from '../input/hotkey-handler.js';
import {aDict} from '../mod/aDict.js';
import {Note} from '../mod/aNote.js';
import {AnkiController} from '../pages/settings/anki-controller.js';
import {SettingsController} from '../pages/settings/settings-controller.js';
import {DisplayAnki} from './display-anki.js';
import {DisplayAudio} from './display-audio.js';
import {Display} from './display.js';
import {SearchActionPopupController} from './search-action-popup-controller.js';
import {SearchDisplayController} from './search-display-controller.js';
import {SearchPersistentStateController} from './search-persistent-state-controller.js';
import {convertToRomaji} from '../language/ja/japanese-wanakana.js';
import {convertHiraganaToKatakana, convertKatakanaToHiragana, isStringEntirelyKana} from '../language/ja/japanese.js';


await Application.main(true, async (application) => {
    const documentFocusController = new DocumentFocusController('#search-textbox');
    documentFocusController.prepare();

    const searchPersistentStateController = new SearchPersistentStateController();
    searchPersistentStateController.prepare();

    const searchActionPopupController = new SearchActionPopupController(searchPersistentStateController);
    searchActionPopupController.prepare();

    const hotkeyHandler = new HotkeyHandler();
    hotkeyHandler.prepare(application.crossFrame);
    let control;
    try {
        const settingsController = new SettingsController();
        control = new AnkiController(settingsController);
    } catch {
        control = null;
    }
    const display = new Display(application, 'search', documentFocusController, hotkeyHandler);
    await display.prepare();

    const displayAudio = new DisplayAudio(display);
    displayAudio.prepare();

    const displayAnki = new DisplayAnki(display, displayAudio);
    displayAnki.prepare();

    const mecab = new Mecab();
    const aN = new Note();
    if (display) {
        const aD = new aDict(display, displayAudio, displayAnki, control, mecab, true, aN);
        aN.dic = aD.util;
        aN.anki = displayAnki;
        aN.aDict = aD;
        const sv = aN.svClk.bind(aN);
        display.setDict(aD);
        window.vars(aD, displayAnki, aN, sv, {roma: convertToRomaji, hira: convertKatakanaToHiragana,kata: convertHiraganaToKatakana});
    }
    //const searchDisplayController = new SearchDisplayController(tabId, frameId, display, displayAudio, japaneseUtil, searchPersistentStateController);
    const searchDisplayController = new SearchDisplayController(display, displayAudio, searchPersistentStateController);
    await searchDisplayController.prepare();

    display.initializeState();

    document.documentElement.dataset.loaded = 'true';
});
