// Find out if we are a built executable, or have a path to the script.
const PRODUCTION = process.argv[0].match(/agoric(\.exe)?$/i);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  process.exit(1);
}

const args = PRODUCTION ? process.argv.slice(1) : process.argv.slice(2);
if (args.length && args[0] !== 'app') {
  // Use the CLI interface.
  const path = require('path');
  const ep = path.resolve(__dirname, './agoric-cli/entrypoint.cjs');
  if (PRODUCTION) {
    // FIXME: Hack to standardize what agoric-cli entrypoint receives.
    process.argv = [process.execPath, ep, ...process.argv.slice(1)];
  }
  require(ep);
} else {
  const esmRequire = require('esm')(module);

  console.log('FIGME: Electron app', process.argv);
  const main = esmRequire('./main.js').default;
  main(process.argv, PRODUCTION);
  // Wait for clean app.exit().
}
