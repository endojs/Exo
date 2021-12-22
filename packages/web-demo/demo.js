
import './lockdown.js';
import '@agoric/eventual-send/shim.js';
import { makeCapTP } from '@agoric/captp';
import { E } from '@agoric/far';

const defer = () => {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {resolve, reject, promise};
};

const ready = defer();

window.addEventListener('message', event => {
  console.log('Page received message', event.data);
  if (event.source !== window) {
    return;
  }
  const message = event.data;
  if (message === null || typeof message !== 'object') {
    return;
  }
  const { type } = message;
  if (type === 'ENDO_READY') {
    ready.resolve();
  }
});

const initEndo = async () => {
  window.postMessage({
    type: 'ENDO_INIT'
  });

  await ready.promise;
};

const connectEndo = async (near = undefined) => {
  const { port1, port2 } = new MessageChannel();
  window.postMessage({
    type: 'ENDO_CONNECT',
  }, '*', [port2]);

  port1.addEventListener('message', event => {
    console.log('Web received message', event.data);
  });

  port1.start();

  const send = message => {
    console.log('Sending', message);
    port1.postMessage(message);
  };

  const { dispatch, getBootstrap, abort } = makeCapTP(name, send, near);

  port1.addEventListener('message', event => {
    console.log('receiving', event.data);
    dispatch(event.data);
  });

  port1.addEventListener('close', () => {
    abort();
  });

  return getBootstrap();
};

(async () => {
  await initEndo();
  const local = {};
  const remote = connectEndo(local);

  console.log(await E(remote).hi());

})();
