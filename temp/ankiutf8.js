
convertUTF16toUTF8(utf16String) {
    let utf8String = '';
  
    for (let i = 0; i < utf16String.length; i++) {
      const charCode = utf16String.charCodeAt(i);
  
      // Check for surrogate pairs
      if (charCode >= 0xd800 && charCode <= 0xdbff) {
        const nextCharCode = utf16String.charCodeAt(i + 1);
        if (nextCharCode >= 0xdc00 && nextCharCode <= 0xdfff) {
          // Combine surrogate pairs
          const combinedCharCode =
            ((charCode - 0xd800) << 10) + (nextCharCode - 0xdc00) + 0x10000;
          utf8String += String.fromCodePoint(combinedCharCode);
          i++; // Skip next character
          continue;
        }
      }
  
      // Encode non-surrogate characters
      utf8String += String.fromCharCode(charCode);
    }
  
    return utf8String;
  }
encodeObjectStrings(obj) {
    const encoder = new TextEncoder();
    const encodedObj = {};
  
    // Iterate over each key-value pair in the object
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Encode the string value as UTF-8
        
        const encodedString = this.convertUTF16toUTF8(value)
        // Store the encoded string in the encoded object
        encodedObj[key] = encodedString;
      } else if (typeof value === 'object' && value !== null) {
        // Recursively encode strings within nested objects
        encodedObj[key] = this.encodeObjectStrings(value);
      } else {
        // Preserve non-string values as they are
        encodedObj[key] = value;
      }
    }
  
    return encodedObj;
  }