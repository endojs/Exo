import { writable } from 'svelte/store';

// like React useHook, return a store and a setter for it
function makeReadable(value, start = undefined) {
  const store = writable(value, start);
  return [{ subscribe: store.subscribe }, store.set];
}

export function makePostMessage({ onOpen, onMessage, onClose }) {
  const [connected, setConnected] = makeReadable(false);

  console.log('connected');
  const handleMessage = ev => {
    if (ev.data && ev.data.type === 'fromHost') {
      // console.log('receive', ev.data.data);
      onMessage({ data: JSON.stringify(ev.data.data) });
    }
  };

  function openPostMessage() {
    window.addEventListener('message', handleMessage);
    
    // Connection is already open
    setConnected(true);
    onOpen();
  }

  function disconnect() {
    // Do nothing.
    onClose();
    setConnected(false);
    window.removeEventListener('message', handleMessage);
  }

  const sendMessage = obj => {
    // console.log('sending', obj);
    window.postMessage({ type: 'toHost', data: obj }, '*');
  };

  const connectedExt = { ...connected, connect: openPostMessage, disconnect };
  return { connected: connectedExt, sendMessage };
}
