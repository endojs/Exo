const nativeMessagingHostName = 'com.endojs.captp.1';

// TODO integrate
const pumpMessages = (port1, port2) => {
  port1.onMessage.addListener(message => port2.postMessage(message));
  port1.onDisconnect.addListener(() => port2.disconnect());
  port2.onMessage.addListener(message => port1.postMessage(message));
  port2.onDisconnect.addListener(() => port1.disconnect());
};

chrome.runtime.onConnect.addListener(contentScriptPort => {
  const onNativeHostMessage = message => {
    contentScriptPort.postMessage(message);
  };

  const onNativeHostDisconnected = () => {
    contentScriptPort.disconnect();
  };

  const onContentScriptMessage = message => {
    nativePort.postMessage(message);
  };

  const onContentScriptDisconnected = () => {
    nativePort.disconnect();
  };

  const nativePort = chrome.runtime.connectNative(nativeMessagingHostName);
  nativePort.onMessage.addListener(onNativeHostMessage);
  nativePort.onDisconnect.addListener(onNativeHostDisconnected);
  contentScriptPort.onMessage.addListener(onContentScriptMessage);
  contentScriptPort.onDisconnect.addListener(onContentScriptDisconnected);
});
