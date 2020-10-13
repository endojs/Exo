const esmRequire = require('esm')(module);
const main = esmRequire('./preload.js').default;

Promise.resolve(main()).catch(e => console.error('failed to run preload.js:', err));
