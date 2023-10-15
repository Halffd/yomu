//aDict
if(this.wiki){
    if (!nl) {
        try {
            if (!k) {
                nl = results[0].headwords[0].reading
                let r0 = this.jpu.convertKatakanaToHiragana(nl)
                let r1 = this.jpu.convertToRomaji(r0)
                nl = r1
            } else {
                if (nl[r - 1].length > 1) {
                    nl = results[0].onyomi.join(' ')
                } else {
                    nl = results[0].kunyomi.join(' ')
                }
                let r0 = this.jpu.convertKatakanaToHiragana(nl)
                let r1 = this.jpu.convertToRomaji(r0)
                nl = r1
            }
        } catch (error) {
            nl = r
        }
    }
    //let df = this.def(optionsContext, nl, "", ct, 0)
    for (let ii in results) {
        for (let i in results[ii].definitions) {
            let o = ''
            try {
                o = results[0].definitions[i].entries.join(' ')
            } catch { }
            if (this.lang != 'nja' || (this.lang == 'zh' && results[ii].definitions[i].dictionary != 'CC09CEDICT')) {
                for (let j in results[ii].definitions[i].entries) {
                    //                            console.log(error)
                    o = results[ii].definitions[i].entries[j]
                    try {
                        console.log(o.type)
                        if (o.type === undefined) {
                            o = o
                        } else if (o.type == "structured-content") {
                            console.dir(o.content)
                            o = o.content
                            let opi = ''
                            for (let i in o) {
                                //if(typeof o[i].content == 'object')
                                for (let j in o[i].content) {
                                    if (typeof o[i].content[j].content != 'object' && o[i].content[j].content !== undefined) {
                                        opi += o[i].content[j].content + '  '
                                    }
                                }
                            }
                            o = opi.includes('undefined') ? null : opi
                        } else {
                            for (let j in o.content) {
                                try {
                                    o = o.content[j]
                                    if (typeof o != 'pp') {
                                        for (let ij in o.content) {
                                            try {
                                                //console.dir(o.content[j])
                                                o = o.content[ij]
                                                console.dir(o)
                                                o = o.content
                                                if (typeof o == 'object') {
                                                    for (let ji in o) {
                                                        try {
                                                            //console.dir(o.content[j])
                                                            o = JSON.stringify(o.content[ji])
                                                        } catch (e) { }
                                                    }
                                                    //o = null
                                                }
                                            } catch (e) { }
                                        }
                                    }
                                } catch { }
                            }
                        }
                    } catch {
                        o = results[ii].definitions[i].entries[j]
                        o = o.content.join(', ')
                    }

                    //REGEX = ///[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/
                    //[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;

                    if (typeof o == 'object') {
                        o = null
                    }
                    /*ok = REGEX.test(o);
                    let REGEXJP = /[\u3040-\u309f\u30a0-\u30ff]/
                    //[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;
                    //let isKanji = REGEX_CHINESE.test(ws[i]);
                    gg = REGEXJP.test(o);
                    let ru = /^\p{Script=Cyrillic}+$/u;
                    gr = ru.test(o)
                    console.log(k, o, ok, gg, gr)
                    let trr = false
                    if (trr && (ok || gg || gr) && trns) {
                        let tll
                        if (ok && !gg) {
                            tll = await this.tl(o, 'zh', 'en')
                        } else if (gg) {
                            tll = await this.tl(o, 'ja', 'en')
                        } else {
                            tll = await this.tl(o, 'mn', 'en')
                        }
                        console.dir(tll)
                        for (let i in tll) {
                            if (tll[i] !== null && tll[i].length > 0 && typeof tll[i] == 'object') {
                                for (let j in tll[i]) {
                                    if (tll[i][j] !== null && tll[i][j].length > 0 && typeof tll[i][j] == 'object') {
                                        o += tll[i][j][0]
                                        //[k]
                                        //this.t.innerHTML += '</br>'
                                    }
                                }
                            }
                        }
                    }
                    //h.innerHTML += o
                    //h.innerHTML += '; '
                    */
                    if (o && typeof o != 'object') {
                        //o.replaceAll('undefined','')
                        if (!ok && !gg) {
                            O.push(o)
                        } else {
                            os.push(o)
                        }
                        //this.def(optionsContext, r, o, ct2, 1)
                    }
                }
            }
        }
        try {
            let oa = ''
            if (results[ii].frequencies.length > 0) {
                //oa += `Freq:`
                for (let oi in results[ii].frequencies) {
                    //O[ii] += `${results[ii].frequencies[oi].frequency}/`
                }
                //oa += '</br>'
                //elem.querySelector('dd').innerHTML += `<li>${oa}</li>`
            }
        } catch (fefe4) { }
    }
}

async dict(k, optionsContext, i, t, r, ln, nl) {
    //console.dir(japaneseUtil)
    if (parseInt(this.tr(optionsContext, "０１２３４５６７８９　", "0123456789 ")) >= -9999999999) {
        console.log(parseInt(this.tr(optionsContext, "０１２３４５６７８９　", "0123456789 ")))
        return false
    }
    if (optionsContext == ' ') {
        return false
    }
    let py = false
    if (this.part.includes(optionsContext)) {
        py = true
        //return false
    }
    let trns = false
    let REGEX = new RegExp('[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/')
    //[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;
    let ook = REGEX.test(optionsContext);
    //k = ook
    if (ook && optionsContext.length == 1) {
        k = true
    } else {
        k = false
    }
    if (this.lang != 'ja') {
        k = false
    }
    let results = await this._display._findDictionaryEntries(k, optionsContext, true, optionsContext)
    //console.warn(rts)
    try {
        let sc = this.most.slice(0, this.known).includes(optionsContext)
        //console.log(k, optionsContext, i, t, r, ln, this.nl) //(optionsContext,ln,nl)//k, optionsContext, i, t, r, japaneseUtil, sc)
        console.dir(results)
        let h = document.createElement("p")
        //`h.inn`erHTML = optionsContext + "(" + r + "):"
        let ct = document.createElement("tr")
        //let ct2 = document.createElement("tr")
        //let pp
        //ct.style.display = 'grid'
        let prnt = document.createElement("div")
        //let prnt = null
        console.log('==>' + this.nl)
        console.warn(results)
        if (results.length <= 0) {
            return false
        }
        if (!nl) {
            try {
                if (!k) {
                    nl = results[0].headwords[0].reading
                    let r0 = this.jpu.convertKatakanaToHiragana(nl)
                    let r1 = this.jpu.convertToRomaji(r0)
                    nl = r1
                } else {
                    if (nl[r - 1].length > 1) {
                        nl = results[0].onyomi.join(' ')
                    } else {
                        nl = results[0].kunyomi.join(' ')
                    }
                    let r0 = this.jpu.convertKatakanaToHiragana(nl)
                    let r1 = this.jpu.convertToRomaji(r0)
                    nl = r1
                }
            } catch (error) {
                nl = r
            }
        }
        let df = this.def(optionsContext, nl, "", ct, 0)
        let ok
        let gg
        let gr
        var os = []
        //      let df2 = this.def(optionsContext, r, "", ct2, 0)
        let l = 0
        if (sc) {
            ct.querySelector('.headword-kanji-link').style.color = 'rgb(170,255,170)'
            //ct2.querySelector('.headword-kanji-link').style.color = 'rgb(170,255,170)'
            ct.style.color = 'rgb(170,255,170)'
            //ct2.style.color = 'rgb(170,255,170)'
        }
        if (py) {
            ct.querySelector('.headword-kanji-link').style.color = 'rgb(150,150,255)'
            //ct2.querySelector('.headword-kanji-link').style.color = 'rgb(170,255,170)'
            ct.style.color = 'rgb(150,150,255)'
            //ct2.style.color = 'rgb(170,255,170)'
        }
        //console.log(optionsContext)//console.dir(results[ii])
        let func = function (e) {
            console.log("Looping each index element ", e)
            return e.title.includes("li")
        }
        //let fr = results.filter((item)=>func(item));
        //console.log(`Str: ${fr}`)
        for (let ii in results) {
            for (let i in results[ii].definitions) {
                //console.log(results[0].definitions[i].entries.join(','))
                l += 1
                //if (l > this.limit) {
                //break}
                let o = ''
                try {
                    o = results[0].definitions[i].entries.join(' ')
                } catch {

                }
                if (this.lang != 'nja' || (this.lang == 'zh' && results[ii].definitions[i].dictionary != 'CC09CEDICT')) {
                    for (let j in results[ii].definitions[i].entries) {
                        //                            console.log(error)
                        o = results[ii].definitions[i].entries[j]
                        try {
                            console.log(o.type)
                            if (o.type === undefined) {
                                o = o
                            } else if (o.type == "structured-content") {
                                console.dir(o.content)
                                o = o.content
                                let opi = ''
                                for (let i in o) {
                                    //if(typeof o[i].content == 'object')
                                    for (let j in o[i].content) {
                                        if (typeof o[i].content[j].content != 'object' && o[i].content[j].content !== undefined) {
                                            opi += o[i].content[j].content + '  '
                                        }
                                    }
                                }
                                o = opi.includes('undefined') ? null : opi
                            } else {
                                for (let j in o.content) {
                                    try {
                                        o = o.content[j]
                                        if (typeof o != 'pp') {
                                            for (let ij in o.content) {
                                                try {
                                                    //console.dir(o.content[j])
                                                    o = o.content[ij]
                                                    console.dir(o)
                                                    o = o.content
                                                    if (typeof o == 'object') {
                                                        for (let ji in o) {
                                                            try {
                                                                //console.dir(o.content[j])
                                                                o = JSON.stringify(o.content[ji])
                                                            } catch (e) { }
                                                        }
                                                        //o = null
                                                    }
                                                } catch (e) { }
                                            }
                                        }
                                    } catch { }
                                }
                            }
                        } catch {
                            o = results[ii].definitions[i].entries[j]
                            o = o.content.join(', ')
                        }

                        //REGEX = ///[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/
                        //[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;

                        if (typeof o == 'object') {
                            o = null
                        }
                        ok = REGEX.test(o);
                        let REGEXJP = /[\u3040-\u309f\u30a0-\u30ff]/
                        //[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;
                        //let isKanji = REGEX_CHINESE.test(ws[i]);
                        gg = REGEXJP.test(o);
                        let ru = /^\p{Script=Cyrillic}+$/u;
                        gr = ru.test(o)
                        console.log(k, o, ok, gg, gr)
                        let trr = false
                        if (trr && (ok || gg || gr) && trns) {
                            let tll
                            if (ok && !gg) {
                                tll = await this.tl(o, 'zh', 'en')
                            } else if (gg) {
                                tll = await this.tl(o, 'ja', 'en')
                            } else {
                                tll = await this.tl(o, 'mn', 'en')
                            }
                            console.dir(tll)
                            for (let i in tll) {
                                if (tll[i] !== null && tll[i].length > 0 && typeof tll[i] == 'object') {
                                    for (let j in tll[i]) {
                                        if (tll[i][j] !== null && tll[i][j].length > 0 && typeof tll[i][j] == 'object') {
                                            o += tll[i][j][0]
                                            //[k]
                                            //this.t.innerHTML += '</br>'
                                        }
                                    }
                                }
                            }
                        }
                        //h.innerHTML += o
                        //h.innerHTML += '; '
                        if (o && typeof o != 'object') {
                            //o.replaceAll('undefined','')
                            if (!ok && !gg) {
                                this.def(optionsContext, nl, o, ct, 1)
                            } else {
                                os.push(o)
                            }
                            //this.def(optionsContext, r, o, ct2, 1)
                        }
                    }
                }
            }
        }
        let o = ''
        if (k) {
            try {
                o = `Onyomi: ${results[0].kunyomi.join(' ')}</br>Kunyomi: ${results[0].onyomi.join(' ')}</br>${results[0].definitions.join(', ')}</br>`
            } catch (error) {
                console.log(error)
            }
        }
        if (k) {
            for (let io in results) {
                if (io > 0) {
                    o += `${results[io].definitions.join(', ')}`
                    let ok = REGEX.test(o);
                    //let REGEXJP = /[\u3040-\u309f\u30a0-\u30ff]/
                    //[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;
                    //let isKanji = REGEX_CHINESE.test(ws[i]);
                } else {
                    if (results[io].frequencies.length > 0) {
                        o += `Freq:`
                        for (let oi in results[io].frequencies) {
                            o += `${results[io].frequencies[oi].frequency}/`
                        }
                        o += '</br>'
                    }
                }
            }
            //o.replaceAll('undefined','')
            //h.innerHTML += o
            if (o.length > 0) {
                this.def(optionsContext, r, o, ct, 1)
                //this.def(optionsContext, r, o, ct2, 1)
                //h.innerHTML += '; '
            }
        }
        if (this.wiki) {
            let z = optionsContext
            let all = await this.originate(z, h, optionsContext)
            let jl = all[0]
            let org = all[1]
            let al = all[2]
            console.dir(all)
            let sr
            //console.log(z, st)
            if (!k) {
                `ct.querySelector('#means')`.innerHTML += '</br>'
            }
            for (let it in org) {
                if (!(org[it].includes('Chinese') || org[it].includes('Glyph origin'))) {
                    ct.querySelector('#means').innerHTML += org[it]
                }
            }
            //ct.querySelector('#means').innerHTML = ct.querySelector('#means').innerHTML.replace('Phono-semantic compound', 'PhonoS')
            for (let it in jl) {
                if (jl[it]) {
                    ct.querySelector('#means').innerHTML += jl[it]
                }
            }
            for (let it in all[3]) {
                if (all[3][it]) {
                    ct.querySelector('#means').innerHTML += all[3][it]
                }
            }
            for (let it in al) {
                if (al[it]) {
                    ct.querySelector('#means').innerHTML += al[it]
                }
            }
            //console.log(org, jl, al, z, lu, llang, oorgn, jjp)
            //console.dir(st)    
            let SE = new RegExp(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/);
            let isk = SE.test(optionsContext);
            if (z.length > 1 && isk) {
                for (let ik in z) {
                    ct.querySelector('#means').innerHTML += '<footer class="pw">'
                    let sk = SE.test(z[ik]);
                    if (sk) {
                        all = await this.originate(z[ik], h, optionsContext)
                        jl = all[0]
                        org = all[1]
                        al = all[2]
                        console.dir(all)
                        let sr
                        //console.log(z, st)
                        let pw = ct.querySelectorAll('.pw')
                        pw = pw[pw.length - 1]
                        pw.innerHTML += `</br><p class="ppw" style="background-color: brown; margin: 2px; color: white; font-sdize: 2em;">-- ${z[ik]} --</p></br>`
                        pw.onclick = () => {
                            if (pw.style.display == "none") {
                                pw.style.display = "block";
                            } else {
                                pw.style.display = "none";
                            }
                        }
                        for (let it in org) {
                            if (!(org[it].includes('Chinese') || org[it].includes('Glyph origin'))) {
                                pw.innerHTML += org[it]
                            }
                        }
                        //ct.querySelector('#means').innerHTML = ct.querySelector('#means').innerHTML.replace('Phono-semantic compound', 'PhonoS')
                        for (let it in jl) {
                            if (jl[it]) {
                                pw.innerHTML += jl[it]
                            }
                        }
                        for (let it in all[3]) {
                            if (all[3][it]) {
                                pw.innerHTML += all[3][it]
                            }
                        }
                        for (let it in al) {
                            if (al[it]) {
                                pw.innerHTML += al[it]
                            }
                        }
                    }
                    ct.querySelector('#means').innerHTML += '</footer>'
                }
            }
        }

        let y = optionsContext
        let RGEX_CHINESE = new RegExp(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/);
        let iji = RGEX_CHINESE.test(y);
        if (iji && y.length > 1) {
            for (let i in y) {
                let ijii = RGEX_CHINESE.test(y[i]);
                if (ijii) {
                    let result = await this._display._findDictionaryEntries(true, y[i], true, y[i])
                    try {
                        o = `[${y[i]}] Onyomi: ${result[0].kunyomi.join(' ')}</br>Kunyomi: ${result[0].onyomi.join(' ')}</br>${result[0].definitions.join(', ')}</br>`
                    } catch (error) {
                        console.log(error)
                    }
                    for (let io in results) {
                        if (io > 0) {
                            //o += `${result[io].definitions.join(', ')}`
                        }
                    }
                    this.def(optionsContext, r, o, ct, 1)
                }
            }
        }
        for (let oi in os) {
            //os[oi].replaceAll('undefined','')
            this.def(optionsContext, r, os[oi] + ' ', ct, 1)
        }
        //ct.style.flex = '15%'
        //ct.style.display = 'flex'
        //ct.style.alignItems = 'center'
        elem.ondblclick = () => {
            if (ct.querySelector('.entry-body').style.width != '') {
                elem.querySelector('.entry-body').style.width = ''
                elem.querySelector('.entry-body').style.height = ''
                elem.style.flex = ''
            } else {
                elem.querySelector('.entry-body').style.height = this.limit;
                elem.querySelector('.entry-body').style.width = this.wid;
                elem.style.flex = '15%'
            }
        }
        //ct2.style.flex = '15%'
        //ct2.style.display = 'flex'
        //ct2.style.alignItems = 'center'
        let REGEX_CHINESE = new RegExp(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/);
        let isKanji = true //REGEX_CHINESE.test(optionsContext);
        if (isKanji) {
            if (this.nl) {
                //prnt.style.display = 'flex'
                prnt.style.display = 'flex'
                prnt.style.alignItems = 'center'
                let ptxt = document.createElement("tr")
                //prnt.style.flex = '15%'
                prnt.style.flexWrap = 'wrap'
                ptxt.style.border = '2px solid rgb(120,0,0)'
                ptxt.innerHTML = `<td>${ln}</td>`
                ///prnt.style.width = '0.8em'
                //prnt.style.height = '0.8em'
                //prnt.style.position= 'relative'
                //ptxt.style.top= '-100px'
                //prnt.appendChild(ptxt)
                ///ct2.innerHTML += `<p>${ln}</p>`
                //pp = prnt
                console.dir(ptxt)
                ptxt.style.border = '2px solid red'
                this.modP.appendChild(ptxt)
                this.modK = this.modP.appendChild(document.createElement("td"))
                this.modK.id = 'modK'
                this.modK.style.display = 'flex'
                this.modK.style.flexWrap = 'wrap'
                this.modK.style.minWidth = '10%'
                this.nl = false
            }
            prnt.style.border = '2px solid gray'
            ct.classList.add('kanji')
            prnt.appendChild(ct)
            this.modK.appendChild(prnt)
        } else {//this.mod.appendChild(ct)
            if (this.nll) {
                //prnt.style.display = 'flex'
                prnt.style.display = 'flex'
                prnt.style.alignItems = 'center'
                let ptxt = document.createElement("tr")
                prnt.style.flex = '15%'
                prnt.style.flexWrap = 'wrap'
                ptxt.style.border = '2px solid rgb(120,0,0)'
                ptxt.innerHTML = `<td>${ln}</td>`
                ///prnt.style.width = '0.8em'
                //prnt.style.height = '0.8em'
                //prnt.style.position= 'relative'
                //ptxt.style.top= '-100px'
                prnt.appendChild(ptxt)
                ///ct2.innerHTML += `<p>${ln}</p>`
                //pp = prnt
                console.dir(ptxt)
                this.nll = false
            }
            let ct2 = ct.cloneNode(true)
            prnt.style.border = '2px solid black'
            prnt.appendChild(ct2)
            //pp.appendChild(ct2)
            this.mod.appendChild(prnt)
        }
        this.modC.appendChild(h)
        let done = true
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}

let runner = async () => {
    if (fr) {
        //const at = setTimeout(() => { this.frst = true }, 5000)
        //fr = false
    }
    //let rts = await this._display._findDictionaryEntries(k, optionsContext, true, optionsContext)
    //console.warn(rts)
    this.lq = this._display.fullQuery
    this.frst = false
    ft = false
    this.frst = ft
    try {
        console.dir(document.querySelectorAll('div>span.query-parser-term.newline'))
        console.log(`Search mode ${this._display._container}`)
        let txt = this._display.fullQuery
        //let mode = 'lyrics'
        let spl = txt.split('\n')//.filter(item=>item);
        //console.dir(spl)
        let k = false
        const optionsContext = this._display.getOptionsContext();
        let rm = document.querySelectorAll('.entry')
        for (let e in rm) {
            try {
                rm[e].parentElement.removeChild(rm[e]);
            } catch { }
        }
        this.modP2.id = 'modP'
        //console.dir(this.modK)
        //this.modK.innerHTML = '99999999999999'
        this.mod2 = this._display._container.appendChild(document.createElement("div"))
        this.mod2.id = 'mod'
        this.modC2 = this._display._container.appendChild(document.createElement("footer"))
        this.modC2.id = 'def'
        //this.modK.prntElement.style.display = 'flex'
        this.t = this._display._container.appendChild(document.createElement("div"))
        this.t.id = 'tl'
        this.modP2 = this._display._container.appendChild(document.createElement("div"))
        //document.querySelector('.content-body-inner').style.removeProperty('width')
        this.modP2.style.display = 'inline-block'
        this.mod2.style.display = 'flex'
        this.mod2.style.flexWrap = 'wrap'
        this.mod2.style.flex = '15%'
        let ii
        //let c = document.querySelectorAll('.query-parser-term')
        //let nl = document.querySelectorAll(``)
        //console.dir(c)
        let ix = 0
        let tx = 0
        this.nl = true
        this.nll = true
        let pix = 0
        for (ii in spl) {
            try {
                if (this.start && ii >= 0) {
                    let tts = ''
                    let tt = ''
                    //let ciir = c[ii].querySelectorAll('.query-parser-segment-reading')
                    tt = spl[ii]//.querySelectorAll('.query-parser-segment-text')
                    //let ind = parseInt(c[ii].getAttribute('data-offset'))
                    //let lind = parseInt(c[ii - 1].getAttribute('data-offset'))
                    let il = tt.length
                    ix = ii
                    let tp = ''
                    console.log(`${parseInt(ii) + 1}/${spl.length}.  : `, ii, tt, tts, ix)
                    if (spl[ii] >= 0) {
                        this.nl = true
                        this.nll = true
                        console.log(`===-=>${this.nl}`)
                        //if (mode == 'lyrics') { }
                    }
                    /*while(spl[ix].indexOf(tt) == -1){
                        ix -= 1
                        if (ix < 0) {
                            ix = 0
                            break
                        }
                    }*/
                    //}ciit[ii-1].innerText.length
                    let ptxt = document.createElement('td')
                    ptxt.style.border = '2px solid rgb(120,0,0)'
                    ptxt.innerHTML = `<ruby><p>${spl[ii]}</p><rt></rt></ruby>`
                    ///prnt.style.width = '0.8em'
                    //prnt.style.height = '0.8em'
                    //prnt.style.position= 'relative'
                    //ptxt.style.top= '-100px'
                    this.modP2.appendChild(ptxt)
                    this.modK2 = this.modP2.appendChild(document.createElement("td"))
                    this.modK2.id = 'modK'
                    this.modK2.style.display = 'flex'
                    this.modK2.style.flexWrap = 'wrap'
                    this.modK2.style.minWidth = '10%'
                    let isKana = japaneseUtil.isStringPartiallyJapanese(tt)
                    //console.log(isKanji);
                    if (isKana) {
                        let sc = this.most.slice(0, this.known).includes(tt)
                        if (sc) {
                            //c[ii].style.color = 'rgb(170,255,170)'
                        }
                        let moe = await this.web(encodeURI(`https://ichi.moe/cl/qr/?r=htr&q=${tt}`))
                        //let css = moe.querySelectorAll('link[rel="stylesheet"]')
                        //let img = moe[1]
                        //document.getElementsByTagName('head')[0].insertAdjacentHTML('beforeend','<link rel="stylesheet" href="path/to/style.css" />');
                        //this.modC.innerHTML += moe
                        this.modC2.innerHTML = `<iframe class="mo" style="display: none;"></iframe>`
                        let mo = this.modC2.querySelectorAll(".mo")
                        mo = mo[mo.length - 1]
                        console.error(mo)
                        mo.contentWindow.document.head.innerHTML = `<meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width,initial-scale=1">
                        <title>Search Moe</title>
                        <link rel="stylesheet" type="text/css" href="./moe.css">`
                        mo.contentWindow.document.body.innerHTML = '<div class="moe">' + moe + '</div>'
                        let moi = mo.querySelector('.moe')
                        //mo.contentWindow.document.querySelector('.header').remove()
                        //mo.contentWindow.document.querySelector('#div-ichiran-form').remove()
                        //mo.contentWindow.document.querySelector('#div-ichiran-result').remove()
                        //moi.innerHTML = moe
                        let mns = mo.contentWindow.document.querySelectorAll('div.gloss-content.scroll-pane > dl')
                        let rom = mo.contentWindow.document.querySelectorAll('#div-ichiran-result > p > em')
                        console.error(mns, rom)
                        let w = []
                        for (let i in mns) {
                            if (mns[i].innerHTML) {
                                w.push(mns[i].querySelector('dt').innerHTML)
                                this.modK2.innerHTML += `<div class="mns" style="border: 2px solid gray;">${mns[i].innerHTML}</div>`
                            }
                        }
                        //const makeNextPromise = (t) => async () 
                        //{
                        let ws = []// segmenter.segment(tt)
                        //ws = ws.filter(function (entry) { return entry.replace(/^[\s,]+|[\s,]+$|\s*(\s|,)[\s,]|[.]*/g, "").trim() != ''; });
                        console.warn(tt, '==>', w)
                        //console.log(f)
                        //return f
                        //}
                        //promiseChain = promiseChain.then(makeNextPromise(''))
                    } else {
                        //let prnt = document.createElement("div")
                        //let prnt = null
                        //let st = await this.wkt(tt)
                        //this.modP.innerHTML += spl[ii]
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }
        //console.log(isKana)
        this.tl(this._display.fullQuery.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ''), this.lang, 'en').then((txt) => {
            console.log('tl----------------------')
            console.dir(txt)
            let tl = txt
            for (let i in tl) {
                console.dir(tl[i])
                if (tl[i] !== null && tl[i].length > 0 && typeof tl[i] == 'object') {
                    for (let j in tl[i]) {
                        if (tl[i][j] !== null && tl[i][j].length > 0 && typeof tl[i][j] == 'object') {
                            this.t.innerHTML += tl[i][j][0]
                            //[k]
                            this.t.innerHTML += '</br>'
                        }
                    }
                }
            }
        }
        )
    } catch (e) {
        console.log(e)
    }
}
for (let u in O) {
    elem.innerHTML += `<span style="font-size: 0.98em;">${O[u]}</span>`
}
for (let oi in os) {
    //os[oi].replaceAll('undefined','')
    let o = os[oi]
    if (o) {
        elem.innerHTML += `<li>${o}</li>`
    }
}
