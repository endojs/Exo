/* This is the Exo Front Endo background script.
 * It runs in a special context that has both access to some Electron Node.js
 * CommonJS tools and access to a shadow of the content document.
 * From this vantage, it installs an `exo` object in the content window
 * and uses Electron IPC to create a communication message bridge between Exo
 * and Front Endo.
 */
const { contextBridge, ipcRenderer } = require('electron');

let buffer = []; 
let send = message => { buffer.push(message) };

ipcRenderer.on('message', (_event, message) => {
  // console.log('preload->frontendo', message);
  send(message);
});

contextBridge.exposeInMainWorld('exo', {
  send(message) {
    // console.log('preload->main', message);
    ipcRenderer.send('message', message);
  },
  recv(callback) {
    send = callback;
    for (const message of buffer) {
      send(message);
    }
    buffer = undefined;
  }
});
