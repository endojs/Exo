/* This module oversees the lifecycle of the Exo main process.
 * The Exo main process is responsible for managing Electron windows,
 * receiving requests from programs on the user host on a Unix domain socket,
 * and managing front-end and back-end "Endo" programs.
 * Front Endo programs run in Electron windows and Back Endo programs run in
 * Exo child processes, which is plain Node.js and does not depend on Node.js
 * having been installed elsewhere on the host system.
 *
 * Because Electron doesn't yet inject its capabilities in an ESM module, we
 * receive them from the `exo.cjs` thunk by dependency injection.
 */

/* global HandledPromise, process */

// Establish a perimeter:
import '@agoric/babel-standalone';
import 'ses';
import '@agoric/eventual-send/shim.js';
import './lockdown.js';

// From Node.js:
import popen from 'child_process';
import fs from 'fs';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';

// From third-party dependencies:
import updateElectronApp from 'update-electron-app';
import { resolve as importMetaResolve } from 'import-meta-resolve';

// From Agoric and Endo projects:
import { Far } from '@agoric/marshal';
import { E, makeCapTP } from '@agoric/captp';
import bundleSource from '@agoric/bundle-source';

import { makePromiseKit } from './promise-kit.js';
import { makeCapTPConnection } from './captp-conn.js';
import { spawnBackEndo } from './endo-back-manager.js';
import { whereExoSock } from './exo-sock.js';
import { installChromeNativeMessagingHost } from './native-messaging-host-installer.js';

function sink(error) {
  console.error(error);
}

function resourcePath(url) {
  return fileURLToPath(new URL(url, import.meta.url));
}

const writeExecutable = async (path, content) => {
  return fs.promises.writeFile(path, content, { mode: 0o755 });
};
const write= async (path, content) => {
  return fs.promises.writeFile(path, content);
};

async function installChrome() {
  const nodePath = process.argv[0];
  await installChromeNativeMessagingHost({
    write,
    writeExecutable
  }, {
    platform: process.platform,
    env: process.env,
    nodePath,
  });

  console.log('Installed Chrome native messaging host');
}

export async function main({ _args, electron, electronReload, isProduction }) {
  const { app, autoUpdater, BrowserWindow, Menu, Tray, ipcMain, shell } = electron;

  if (!app.requestSingleInstanceLock()) {
    app.quit();
    return;
  }

  // Use this to automatically download updates on Windows and MacOS.
  // Requires code signing, and publishing to a public repo on github.
  updateElectronApp({ repo: 'endojs/endo' });

  if (!isProduction) {
    const workspacePath = resourcePath('../../..');
    electronReload(workspacePath, {
      electron: app.getPath('exe'),
      awaitWriteFinish: true,
    });
  }

  installChrome();

  const frontEndoHtmlUrl = await importMetaResolve(
    '../public/front-endo.html',
    import.meta.url,
  );
  const frontEndoHtmlPath = new URL(frontEndoHtmlUrl).pathname;
  const exoConsoleUrl = await importMetaResolve(
    './exo-console.js',
    import.meta.url,
  );
  const exoConsolePath = new URL(exoConsoleUrl).pathname;

  const exoConsoleBundle = await bundleSource(exoConsolePath);
  const sockPath = whereExoSock(process.platform, process.env);

  // This is needed to map the Pledger systray to the signing certificate.  For
  // non-production runs we use a different value.
  const TRAY_GUID = isProduction
    ? 'DE8D38CB-4B15-4153-B549-745067ADC852'
    : 'C728AAD2-DA20-421C-B534-97023DACF258';

  // console window WebContents -> capTP dispatch function forwarding IPC
  // messages to the corresponding CapTP connection.
  const dispatchers = new WeakMap();

  let currentExoConsolePK = makePromiseKit();
  const exoConsoleP = new HandledPromise(
    (_resolve, _reject, resolveWithPresence) => {
      resolveWithPresence({
        applyMethod(_p, name, args) {
          return E(currentExoConsolePK.promise)[name](...args);
        },
      });
    },
  );

  let consoleWindow;
  const provideConsoleWindow = () => {
    if (consoleWindow !== undefined) {
      return;
    }

    // Create the browser window.
    consoleWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: resourcePath('endo-front-back.cjs'),
      },
    });

    // And load the index.html of the app.
    consoleWindow.loadFile(frontEndoHtmlPath);

    consoleWindow.webContents.on('did-finish-load', () => {
      const send = message =>
        consoleWindow.webContents.send('message', message);
      const { dispatch, getBootstrap } = makeCapTP('Exo', send);
      dispatchers.set(consoleWindow.webContents, dispatch);
      const bootstrap = getBootstrap();
      // TODO pass endo powers for communication back to Exo, including
      // requests for introductions to additional powers.
      const grantedPowers = [];
      const endoP = Far('Endo', {}); // TODO make a power facet for this specific instance.
      const instance = E(bootstrap).importBundle(
        exoConsoleBundle,
        endoP,
        grantedPowers,
      );
      currentExoConsolePK.resolve(instance);
    });

    consoleWindow.on('closed', () => {
      currentExoConsolePK = makePromiseKit();
      consoleWindow = undefined;
    });
  };

  const exo = Far('Exo', {
    async importBundle(bundle) {
      // Petition the user for authorization to install this thing.
      // If accepted, spawn a process and use its stdio for a capTP bridge
      // back to the installer, as well as a means to reconnect if that
      // bridge falls.
      // TODO separate installation from execution.
      // TODO Provide options for lifecycle coupling between the installer or
      // executor process and the back-endo process.
      // TODO Provide options for automatically restarting installed back-endos
      // whenever Exo reopens. Capture back-endo installations in per-user
      // configuration storage.
      // TODO Surface the size of the installation to the user.
      // TODO Provide an interface for deleting installations.
      // TODO Support pet names for installations and instances.
      // TODO Support requests for reintroduction to existing instances.
      // TODO Extract requestedPowers and hash from the bundle.
      provideConsoleWindow();
      consoleWindow.show();
      try {
        const hash = '<unknown>';
        const requestedPowers = [];
        console.log('waiting');
        const { granted, grantedPowers, petName } = await E(
          exoConsoleP,
        ).requestImportBundle(hash, requestedPowers);
        console.log('answer', { granted, grantedPowers, petName });
        // TODO Receive and track a pet name for the instance.
        if (granted) {
          // TODO thread stdout and stderr, buffer in memory, and replay
          // in a web-based terminal emulator in a window on demand.
          // TODO create button for opening a web inspector for the back-endo
          // process.
          // TODO virtualize the back-endo console.
          // TODO create a Causeway window for attached back-endos.
          const { getBootstrap, drained, exited, kill } = await spawnBackEndo(
            popen.fork,
            'BackEndo',
            exoConsoleP,
          );
          drained.catch(sink);
          // TODO send process control to Exo Console.
          exited
            .then(() => {
              // TODO Inform the user through the Exo Console.
              console.log('Back-endo exited');
            })
            .catch(sink);
          const bootstrap = getBootstrap();
          // TODO make a power facet for this specific instance.
          const endo = Far('Endo', {
          });
          const api = E(bootstrap).importBundle(bundle, endo, grantedPowers);
          return Far('BackEndo', {
            getAPI() {
              return api;
            },
            // TODO kill, detach, etc
          });
        } else {
          throw new Error('Installation request denied by user');
        }
      } finally {
        consoleWindow.hide();
        app.hide();
      }
    },
    // TODO install a bundle to be stored an instantiated on demand, on startup, &c.
    // TODO request a revokable introduction to an existing instance by alleged
    // type.
  });

  ipcMain.on('message', (event, message) => {
    const dispatch = dispatchers.get(event.sender);
    if (dispatch !== undefined) {
      dispatch(message);
    }
  });

  let appTray = null;
  const createTray = async () => {
    const trayIconPath = resourcePath(
      process.platform === 'win32'
        ? '../asset/exo.ico'
        : '../asset/exo-task-tray-22.png',
    );
    appTray = new Tray(trayIconPath, TRAY_GUID);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Exo Console',
        async click() {
          provideConsoleWindow();
          consoleWindow.show();
        },
      },
      { role: 'quit' },
    ]);

    appTray.setToolTip('Exo');
    appTray.setContextMenu(contextMenu);
    appTray.on('click', () => appTray.popUpContextMenu());
  };

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app
    .whenReady()
    .then(createTray)
    .catch(sink);

  // We have a tray that we want to stay active until the user quits
  // explicitly with Cmd + Q, or there is an auto-update.
  let installingUpdate = false;
  autoUpdater.on('before-quit-for-update', () => (installingUpdate = true));
  app.on('window-all-closed', () => {
    if (installingUpdate) {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      provideConsoleWindow();
    }
  });

  await fs.promises.mkdir(path.dirname(sockPath), { recursive: true });
  const server = net.createServer();
  server.listen(sockPath, () => {
    console.log(`Listening on ${sockPath}`);
  });
  server.on('connection', conn => {
    const { drained } = makeCapTPConnection('Exo', conn, exo);
    drained.catch(sink);
    provideConsoleWindow();
    consoleWindow.show();
  });
}
