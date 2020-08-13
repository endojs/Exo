#! /usr/bin/env node

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  process.exit(1);
}

const esmRequire = require('esm')(module);

// If we are executed with the 'solo' argument, run ag-solo with the rest.
const args = process.argv.slice(2);
if (args.length === 0) {
  require('./src/index.js');
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
}
