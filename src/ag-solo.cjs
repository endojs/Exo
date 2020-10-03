// ag-solo entrypoint
const esmRequire = require('esm')(module);
const path = require('path');

// Add our bin directory to the path, so we can find our ag-cosmos-helper
process.env.PATH = `${path.join(__dirname, '..', 'bin')}${path.delimiter}${process.env.PATH}`;

// If you see:
// /Users/michael/agoric/agoric-sdk/node_modules/depd/index.js:1
// TypeError: callSite.getFileName is not a function
//     at callSiteLocation (/Users/michael/agoric/agoric-sdk/node_modules/depd/index.js:252:23)
//     at depd (/Users/michael/agoric/agoric-sdk/node_modules/depd/index.js:111:14)
//     at Object.<anonymous> (/Users/michael/agoric/agoric-sdk/node_modules/body-parser/index.js:14:32)
//     at Object.Module._extensions..js (internal/modules/cjs/loader.js:1004:10)
//
// then you need the depd patch with:
// cd agoric-sdk
// git revert 354a3aecc3c26f06d90d5648201ad32f4269b51a
esmRequire('@agoric/cosmic-swingset/lib/ag-solo/entrypoint.js');
