// Find out if we are a built executable, or have a path to the script.
const PRODUCTION = !require('electron-is-dev');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  process.exit(1);
}

const args = PRODUCTION ? process.argv.slice(1) : process.argv.slice(2);
const esmRequire = require('esm')(module);
require('node-lmdb');

console.log('FIGME: Electron app', process.argv, `PRODUCTION=${PRODUCTION}`);
const main = esmRequire('./main.js').default;
main(process.argv, PRODUCTION);
// Wait for clean app.exit().
