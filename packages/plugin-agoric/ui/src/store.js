import { writable } from 'svelte/store';
// import { E } from '@agoric/eventual-send';
// import { updateFromNotifier } from '@agoric/notifier';

import { makeCapTPConnection } from './captp';
import { makePostMessage } from './postmessage';

// Create a connection so that we can derive presences from it.
const { connected, makeStableForwarder } = makeCapTPConnection(
  makePostMessage, { onReset },
);

export { connected };

// Get some properties of the bootstrap object as stable identites.
export const appP = makeStableForwarder(bootP => bootP);

const resetAlls = [];

// We initialize as false, but reset to true on disconnects.
const [ready, setReady] = makeReadable(false, true);

export { ready };

function onReset(readyP) {
  // Reset is beginning, set unready.
  setReady(false);

  // When the ready promise fires, reset to ready.
  readyP.then(() => resetAlls.forEach(fn => fn()));
}

// like React useHook, return a store and a setter for it
function makeReadable(value, reset = value) {
  const store = writable(value);
  resetAlls.push(() => store.set(reset));
  return [{ subscribe: store.subscribe }, store.set];
}
