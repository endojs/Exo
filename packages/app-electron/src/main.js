import '@agoric/install-ses';
import { makeCapTP, E } from '@agoric/captp';
import { app, autoUpdater, BrowserWindow, Menu, shell, Tray } from 'electron';
import path from 'path';

const WALLET_PORT = 8000;

import { bootPlugin as bootAppPlugin } from '@pledger/plugin-agoric-app/src/server';

async function main(args, isProduction) {
  // Use this to automatically download updates on Windows and MacOS.
  // Requires code signing, and publishing to a public repo on github.
  require('update-electron-app')({ repo: 'agoric-labs/Pledger' });

  if (!isProduction) {
    require('electron-reload')(path.join(__dirname, '../../..'), {
      electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
      awaitWriteFinish: true,
    });
  }

  // This is needed to map the Pledger systray to the signing certificate.  For
  // non-production runs we use a different value.
  const TRAY_GUID = isProduction ? 'DE8D38CB-4B15-4153-B549-745067ADC852' : 'C728AAD2-DA20-421C-B534-97023DACF258';

  // Needed to display on Ubuntu 2020.04 under Parallels
  app.disableHardwareAcceleration();

  // Construct a CapTP channel.
  const appPlugin = bootAppPlugin({});

  // Start the ag-solo running.
  E(appPlugin).fork('Agoric', 'ag-solo', 'setup');

  let cleanup = false;
  app.on('will-quit', e => {
    if (cleanup) {
      return;
    }
    
    cleanup = true;
    e.preventDefault();
    E(appPlugin).dispose().finally(() => app.exit());
  })

  let dashboardWindow = null;
  const createDashboardWindow = async () => {
    if (dashboardWindow) {
      if (dashboardWindow.isMinimized()) {
        dashboardWindow.restore();
      }
      dashboardWindow.focus();
      return dashboardWindow;
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

    const send = obj => {
      // console.log('FIGME: main posting', obj);
      if (!cleanup) {
        dashboardWindow.webContents.send('host', obj);
      }
    };

    const { dispatch, abort } = makeCapTP('renderer', send, appPlugin);

    dashboardWindow.on('close', () => {
      // Close the captp connection successfully.
      abort();
      dashboardWindow = null;
    });

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
    return dashboardWindow;
  };

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (dashboardWindow) {
      createDashboardWindow();
    }
  });
  
  let appTray = null;
  const createTray = async () => {
    const icon = process.platform === 'win32' ? 'agoric.ico' : 'agoric-systray.png';
    appTray = new Tray(`${__dirname}/../assets/${icon}`, TRAY_GUID);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Open Agoric Wallet', async click() {
        const ac = await E(appPlugin).getAccessToken(WALLET_PORT);
        shell.openExternal(`http://localhost:${WALLET_PORT}/wallet#accessToken=${ac}`);
      } },
      { label: 'Agoric Console (REPL)', async click() {
        const ac = await E(appPlugin).getAccessToken(WALLET_PORT);
        shell.openExternal(`http://localhost:${WALLET_PORT}/?w=0#accessToken=${ac}`);
      } },
      { type: 'separator' },
      { label: 'Pledger Dashboard...', click: createDashboardWindow },
      { type: 'separator' },
      { role: 'about' },
      { role: 'quit' },
    ]);

    appTray.setToolTip('Pledger Wallet');
    appTray.setContextMenu(contextMenu);
    appTray.on('click', () => appTray.popUpContextMenu());

    if (args[0] === 'dash') {
      // Pop up the dashboard immediately.
      createDashboardWindow();
    }
  };

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // app.on('ready', createWindow);
  app.on('ready', createTray);

  // We have a tray that we want to stay active until the user quits
  // explicitly with Cmd + Q, or there is an auto-update.
  let installingUpdate = false;
  autoUpdater.on('before-quit-for-update', () => installingUpdate = true);
  app.on('window-all-closed', () => {
    if (installingUpdate) { //  || process.platform !== 'darwin'
      app.quit();
    }
  });

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

export default function singleInstanceMain(...args) {
  const { app } = require('electron')
  const gotTheLock = app.requestSingleInstanceLock()
  if (gotTheLock) {
    return main(...args);
  }
  app.quit();
}
