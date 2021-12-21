// @ts-check

import path from 'path';
import { fileURLToPath } from 'url';
import { batchQuote } from './quote-batch.js';
import { shellQuote } from './quote-shell.js';

const extensionId = 'pfhgpnekceenkaengbgogpamondogekm';
const hostName = 'com.endojs.captp.1';
const hostDescription = 'Endo bridge';
const nativeMessagingHostPath = fileURLToPath(
  new URL('native-messaging-host.js', import.meta.url),
);

const textEncoder = new TextEncoder();

/**
 * @param {string} platform
 * @param {{[name: string]: string}} env
 * @param {boolean} [all] - whether to install for all users
 */
export const whereNativeMessagingHosts = (platform, env, all = false) => {
  if (platform === 'win32') {
    if (all) {
      return '/etc/opt/chrome/native-messaging-hosts';
    } else {
      return `${env.USERPROFILE}/.config/google-chrome/NativeMessagingHosts`;
    }
  } else {
    if (all) {
      return '/Library/Google/Chrome/NativeMessagingHosts';
    } else {
      return `${env.HOME}/Library/Application Support/Google/Chrome/NativeMessagingHosts`;
    }
  }
};

/**
 * @param {string} nodePath
 */
const makeExoNativeMessagingHostBatchScript = nodePath => {
  const text = `\
@echo off
set ELECTRON_RUN_AS_NODE=true
${batchQuote(nodePath)} ${batchQuote(nativeMessagingHostPath)}
`;
  // TODO probably limit text to ASCII
  return textEncoder.encode(text);
};

/**
 * @param {string} nodePath
 */
const makeExoNativeMessagingHostShellScript = nodePath => {
  const text = `\
#!/bin/sh
ELECTRON_RUN_AS_NODE=true exec ${shellQuote(nodePath)} ${shellQuote(nativeMessagingHostPath)}
`;
  // TODO probably limit text to ASCII
  return textEncoder.encode(text);
};

/**
 * @param {string} platform
 * @param {string} hostPath
 */
const makeHostManifest = (platform, hostPath) => {
  return {
    name: hostName,
    description: hostDescription,
    path: hostPath,
    type: 'stdio',
    allowed_origins: [
      `chrome-extension://${extensionId}/`,
    ],
  };
};

/**
 * @param {Object} powers
 * @param {(path: string, content: Uint8Array) => Promise<void>} powers.write
 * @param {(path: string, content: Uint8Array) => Promise<void>} powers.writeExecutable
 * @param {Object} data
 * @param {boolean} [all] - whether to install for all users
 */
export const installChromeNativeMessagingHost = async (
  { writeExecutable, write },
  { platform, env, nodePath },
  all = false,
) => {
  const hostsPath = whereNativeMessagingHosts(platform, env, all);
  const hostPath = platform === 'win32' ?
    `${hostName}.bat` :
    path.join(hostsPath, `${hostName}.sh`);

  const manifest = makeHostManifest(platform, hostPath);
  const manifestText = JSON.stringify(manifest, null, 2);
  const manifestBytes = textEncoder.encode(manifestText);
  const manifestPath = path.join(hostsPath, `${hostName}.json`);

  /** @type {Promise<void> | undefined} */
  let writingScript;
  if (platform === 'win32') {
    const script = makeExoNativeMessagingHostBatchScript(nodePath);
    writingScript = write(path.join(hostsPath, '${hostName}.bat'), script);
  } else {
    const script = makeExoNativeMessagingHostShellScript(nodePath);
    const scriptPath = path.join(hostsPath, `${hostName}.sh`);
    writingScript = writeExecutable(scriptPath, script);
  }

  await writingScript;
  await write(manifestPath, manifestBytes);

  // TODO set registry HKEYs on Windows.
};
