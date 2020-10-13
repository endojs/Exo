import '@agoric/install-ses';
import { ipcRenderer } from 'electron';

async function main() {
  // Forward messages to and from the host.
  window.addEventListener('message', ev => {
    const { type, data } = ev.data;
    if (type === 'toHost') {
      ipcRenderer.send('host', data);
    }
  });
  ipcRenderer.on('host', (_ev, obj) =>
    window.postMessage({ type: 'fromHost', data: obj }, '*'));
}

export default main;
