import '@agoric/install-ses';
import { makeCapTP, E } from '@agoric/captp';
import { app, BrowserWindow } from 'electron';
import path from 'path';

import { bootPlugin as bootAppPlugin } from '@pledger/plugin-agoric-app/src/server';

async function main(argv, isProduction) {
  // TODO: Use this to automatically download updates on Windows and MacOS.
  // Requires code signing.
  require('update-electron-app')();

  require('electron-reload')(path.join(__dirname, '../../..'), {
    electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
    awaitWriteFinish: true,
  });

  // Needed to display on Ubuntu 2020.04 under Parallels
  app.disableHardwareAcceleration();

  const createWindow = async () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
      width: 1024,
      height: 700,
      webPreferences: {
        preload: path.join(__dirname, 'preload-entry.cjs'),
        contextIsolation: true,
        worldSafeExecuteJavaScript: true,
      },
    });

    // Construct a CapTP channel.
    const appPlugin = bootAppPlugin({});

    // Dispose of the plugin when we're closed.
    mainWindow.on('closed', () => E(appPlugin).dispose());

    const send = obj => {
      // console.log('FIGME: main posting', obj);
      mainWindow.webContents.send('host', obj);
    };

    const { dispatch, abort } = makeCapTP('renderer', send, appPlugin);

    mainWindow.webContents.on('ipc-message', async (ev, channel, obj) => {
      // console.log('FIGME: main received on', channel, obj);
      if (channel !== 'host') {
        return;
      }
      // CapTP integration.
      dispatch(obj) || abort(Error(`Message ${obj.type} not understood`));
    });

    // and load the index.html of the app.
    const uiIndex = await E(appPlugin).getUiIndex();
    await mainWindow.loadFile(uiIndex);
  };

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and import them here.
};

export default main;
