import '@agoric/install-ses';
import { makeCapTP, E } from '@agoric/captp';
import { app, BrowserWindow, Menu, shell, Tray } from 'electron';
import path from 'path';
import fs from 'fs';
import os from 'os';

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

  let quitting = false;
  app.on('before-quit', () => {
    // If they hit C-q, treat it as a full exit.
    quitting = true;
  });

  // If auto updating was accepted, allow quitting.
  app.on('before-quit-for-update', () => {
    quitting = true;
  });

  let dashboardWindow = null;
  const createDashboardWindow = async () => {
    app.dock && app.dock.show();
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

    // Just hide.
    dashboardWindow.on('close', e => {
      if (!quitting) {
        e.preventDefault();
        dashboardWindow.hide();
        app.dock && app.dock.hide();
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
      { label: 'Quit Pledger', click() {
        E(appPlugin).dispose().finally(() => app.quit());
      } },
    ]);

    appTray.setToolTip('Pledger Wallet');
    appTray.setContextMenu(contextMenu);
    appTray.on('click', () => appTray.popUpContextMenu());

    if (args[0] === 'dash') {
      // Pop up the dashboard immediately.
      createDashboardWindow();
    } else {
      // Hide the dock icon.
      app.dock && app.dock.hide();
      const ALREADY_POPPED_STAMP = path.join(os.homedir(), '.agoric', 'already-popped.stamp');
      if (!fs.existsSync(ALREADY_POPPED_STAMP)) {
        // Pop up the context menu for engagement.
        const { x, y } = appTray.getBounds();
        appTray.popUpContextMenu(contextMenu, { x, y });

        // Write out the stamp.
        fs.mkdirSync(path.dirname(ALREADY_POPPED_STAMP), { recursive: true, mode: 0o700 });
        fs.writeFileSync(ALREADY_POPPED_STAMP, app.getVersion());
      }
    }
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
