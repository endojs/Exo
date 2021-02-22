// ag-solo entrypoint
const esmRequire = require('esm')(module);
const fs = require('fs');
const path = require('path');
const os = require('os');

// Add our bin directory to the path, so we can find our ag-cosmos-helper
process.env.PATH = `${path.join(__dirname, '..', '..', 'bin')}${path.delimiter}${process.env.PATH}`;

const homeDir = os.homedir();
process.env.AG_SOLO_BASEDIR = `${homeDir}/.agoric/basedir`;

esmRequire('@agoric/cosmic-swingset/lib/ag-solo/entrypoint.js');
