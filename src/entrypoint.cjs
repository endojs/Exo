#! /usr/bin/env node

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  process.exit(1);
}

const esmRequire = require('esm')(module);
let mainP;

// If we are executed with the 'solo' argument, run ag-solo with the rest.
const args = process.argv.slice(2);
if (args.length === 0 || args[0] === 'app') {
  console.log('FIGME: Electron app', process.argv);
  const main = esmRequire('./main.js').default;
  main(process.argv);
  // Wait for clean app.exit().
} else if (args[0] === 'solo') {
  args.shift();
  console.log('FIGME: would execute ag-solo', args);
  process.exit(1);

  const main = esmRequire('./main.js').default;
  
  main(process.argv[1], process.argv.slice(2)).then(
    _res => 0,
    rej => {
      console.log(`error running Agoric:`, rej);
      process.exit(1);
    },
  );
} else {
  console.log('FIGME: would execute agoric-cli', args);
  mainP = Promise.resolve(0);
}

if (mainP) {
  mainP.then(
    res => process.exit(res || 0),
    rej => {
      console.log(`error running Agoric`, args, rej);
      process.exit(1);
    },
  );
}
