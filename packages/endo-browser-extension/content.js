console.log('Endo content script running in this page');

const pumpMessages = (chromePort, webPort) => {

  webPort.addEventListener('message', event => {
    console.log('forwarding message from web to chrome', event.data);
    chromePort.postMessage(event.data);
  });

  chromePort.onMessage.addListener(message => {
    console.log('forwarding message from chrome to web', message);
    webPort.postMessage(message);
  });

  chromePort.onDisconnect.addListener(() => {
    webPort.close();
  });

  webPort.start();

  // TODO observe webPort close.

};

window.addEventListener('message', event => {
  if (event.source !== window) {
    return;
  }

  const message = event.data;

  console.log('Exo content script received message', message);

  if (typeof message !== 'object' || message === null) {
    return;
  }

  if (message.type === 'ENDO_INIT') {
    window.postMessage({ type: 'ENDO_READY' });
  } else if (message.type === 'ENDO_CONNECT') {
    const [webPort] = event.ports;
    // TODO validate port
    const backgroundPort = chrome.runtime.connect();
    console.log('Endo connected background port', backgroundPort, webPort);
    pumpMessages(backgroundPort, webPort);
  }
});

window.postMessage({ type: 'ENDO_READY' });
