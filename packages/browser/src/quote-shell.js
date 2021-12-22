// @ts-check

// https://github.com/substack/node-shell-quote/blob/master/index.js
/**
 * @param {string} s
 */
export const shellQuote = s => {
  // Checking null string fixes defect #40 in substack/node-shell-quote.
  if (s === '') {
    return "''";
  } else if (/["\s]/.test(s) && !/'/.test(s)) {
    return `'${s.replace(/(['\\])/g, '\\$1')}'`;
  } else if (/["'\s]/.test(s)) {
    return `"${s.replace(/(["\\$`!])/g, '\\$1')}"`;
  } else {
    return s.replace(/([A-z]:)?([#!"$&'()*,:;<=>?@\[\\\]^`{|}])/g, '$1\\$2');
  }
};
