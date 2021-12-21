// @ts-check

// https://docs.microsoft.com/en-us/archive/blogs/twistylittlepassagesallalike/everyone-quotes-command-line-arguments-the-wrong-way

/**
 * @param {string} s
 */
const batchEscape = s => {
  if (s !== '' && !/[ \t\n\v"]/.test(s)) {
    return s;
  }

  let o = '"';
  for (let i = 0; i < s.length; i += 1) {
    // Measure out and consume any backslashes.
    const j = i;
    while (j < s.length && s[i] === '\\') {}
    const slashes = j - i;
    i = j;

    if (i === s.length) {
      // Escape all backslashes, but let the terminating double quotation
      // mark we add below be interpreted as a metacharacter.
      for (let k = 0; k < slashes * 2; k += 1) {
        o += '\\';
      }
      break;
    } else if (s[i] === '"') {
      // Escape all backslashes and the following double quotation mark.
      for (let k = 0; k < slashes * 2 + 1; k += 1) {
        o += '\\';
      }
      o += s[i];
    } else {
      // Backslashes aren't special here.
      for (let k = 0; k < slashes; k += 1) {
        o += '\\';
      }
      o += s[i];
    }
  }
  o += '"';
  return o;
};

/**
 * @param {string} s
 */
export const batchQuote = s => {
  return batchEscape(s).replace(/([()%!^"<>&|"])/g, '^$1');
};
