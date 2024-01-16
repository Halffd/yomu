function replace(str, tt, rep = `<s>{}</s>`, reset = false) {
  try {
    if (reset) rI = 0
  cs = str.split('')
  wn(str)
  tg = false
  out = true
  done = false
  searchLen = tt.length
  searchCur = 0
  end = searchLen - 1
  startEnd = [-1, -1]
  res = ''
  rs = rep //.replace('{}', tt)
  let replaceLen = rs.length
  p = ''
  bef = ''
  aft = ''
  for (let i = rI; i <= cs.length; i++) {
    let c = cs[i]
    if (c === `<`) {
      tg = true
    }
    if (c === `>`) {
      tg = false
    }
    if (searchCur > 0) {
      let sb = i - startEnd[0];
      wn(c, cs[startEnd[0]], cs[startEnd[0] + searchCur], startEnd[0], searchCur)
      if (c !== cs[startEnd[0] + searchCur]) {
        searchCur = 0;
      }
    }
    if (c === tt[searchCur]) {
      if (searchCur == 0) {
        startEnd[0] = i
      }
      searchCur += 1
      if (searchCur >= searchLen) {
        startEnd[1] = i + 1
        done = true
      }
    }
    if (done) {
      bef = str.substring(0, startEnd[0])
      aft = str.substring(startEnd[1])
      res = bef + rs + aft
      let resLen = res.length
      rI = startEnd[0] + replaceLen;
      let calculatedLim = replaceLen + rI - searchLen
      wn({i,tt,replaceLen,rI,stoppedin: res[rI],searchLen,resLen,calculatedLim,startEnd,searchCur})
      if (calculatedLim > resLen) {
        rI = 0
      }
      return res
    }
    p = c
  }
  return res
  } catch(error){
    console.error(error);
  }
}
