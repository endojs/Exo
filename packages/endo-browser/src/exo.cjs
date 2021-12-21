/**
 * This module is where Exo starts.
 * Electron provides certain capabilities as the `electron` module,
 * but only in the CommonJS module system.
 * Also, some Electron work must run in the first event, before the Electron
 * `app` is "ready".
 * We do all that work in this CommonJS module and then delegate the Electron
 * powers by dependency-injection to an ESM module that oversees the lifecycle
 * of the Exo main process, `exo.js`.
 */
const electron = require('electron');

// Find out if we are a built executable, or have a path to the script.
const isProduction = !require('electron-is-dev');

const args = isProduction ? process.argv.slice(1) : process.argv.slice(2);

const { app } = electron;

const electronReload = require('electron-reload');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line global-require
if (require('electron-squirrel-startup')) {
  app.quit();
  return;
}

// Needed to display on Ubuntu 2020.04 under Parallels.
// Must be called before app is ready.
app.disableHardwareAcceleration();

(async () => {
  const { main } = await import('./exo.js');
  await main({args, electron, electronReload, isProduction});
})().catch(error => {
  console.log(error);
  app.quit();
});
