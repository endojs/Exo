import '@agoric/install-ses';
import { makeCapTP, E } from '@agoric/captp';
import { app, BrowserWindow, Menu, MenuItem, Tray } from 'electron';
import path from 'path';

const TRAY_GUID = 'C728AAD2-DA20-421C-B534-97023DACF258';

import { bootPlugin as bootAppPlugin } from '@pledger/plugin-agoric-app/src/server';

async function main(argv, isProduction) {
  // Use this to automatically download updates on Windows and MacOS.
  // Requires code signing, and publishing to a public repo on github.
  require('update-electron-app')({ repo: 'agoric-labs/Pledger' });

  require('electron-reload')(path.join(__dirname, '../../..'), {
    electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
    awaitWriteFinish: true,
  });

  // Needed to display on Ubuntu 2020.04 under Parallels
  app.disableHardwareAcceleration();

  // Construct a CapTP channel.
  const appPlugin = bootAppPlugin({});

  // Start the ag-solo running.
  E(appPlugin).fork('Agoric', 'ag-solo', 'setup');

  let exiting = false;
  let dashboardWindow = null;
  app.dock.hide();
  const createDashboardWindow = async () => {
    app.dock.show();
    if (dashboardWindow) {
      dashboardWindow.show();
      return;
    }
    // Create the browser window.
    dashboardWindow = new BrowserWindow({
      width: 1024,
      height: 700,
      webPreferences: {
        preload: path.join(__dirname, 'preload-entry.cjs'),
        contextIsolation: true,
        worldSafeExecuteJavaScript: true,
      },
    });

    // Dispose of the plugin when we're closed.
    // dashboardWindow.on('closed', () => E(appPlugin).dispose());
    dashboardWindow.on('close', e => {
      if (!exiting) {
        e.preventDefault();
        dashboardWindow.hide();
        app.dock.hide();
      }
    });

    const send = obj => {
      // console.log('FIGME: main posting', obj);
      dashboardWindow.webContents.send('host', obj);
    };

    const { dispatch, abort } = makeCapTP('renderer', send, appPlugin);

    dashboardWindow.webContents.on('ipc-message', async (ev, channel, obj) => {
      // console.log('FIGME: main received on', channel, obj);
      if (channel !== 'host') {
        return;
      }
      // CapTP integration.
      dispatch(obj) || abort(Error(`Message ${obj.type} not understood`));
    });

    // and load the index.html of the app.
    const uiIndex = await E(appPlugin).getUiIndex();
    await dashboardWindow.loadFile(uiIndex);
  };

  let appIcon = null;
  const createTray = async () => {
    const icon = process.platform === 'win32' ? 'agoric.ico' : 'agoric-systray.png';
    appIcon = new Tray(`${__dirname}/../assets/${icon}`, TRAY_GUID);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Open Agoric Wallet', click() {
        E(appPlugin).fork('Wallet', 'agoric-cli', 'open');
      } },
      { label: 'Agoric Console (REPL)', click() {
        E(appPlugin).fork('Wallet', 'agoric-cli', 'open', '--repl=only');
      } },
      { type: 'separator' },
      { label: 'Pledger Logs...', click: createDashboardWindow },
      { type: 'separator' },
      { label: 'Quit Pledger', click() {
        exiting = true;
        E(appPlugin).dispose().finally(() => app.quit());
      } },
    ]);

    appIcon.setToolTip('Pledger Wallet');
    appIcon.setContextMenu(contextMenu);
  };

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // app.on('ready', createWindow);
  app.on('ready', createTray);
  

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  /*
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
  */

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createDashboardWindow();
    }
  });

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and import them here.
};

export default main;
