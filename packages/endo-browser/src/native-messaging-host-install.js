/**
 * A manual installer for testing.
 * Just run with Node.js.
 * Will install a messaging host that uses the same Node.js.
 */

// @ts-check

import fs from 'fs';
import { installChromeNativeMessagingHost } from './native-messaging-host-installer.js';

const nodePath = process.argv[0];

/**
 * @param {string} path
 * @param {Uint8Array} content
 */
const writeExecutable = async (path, content) => {
  return fs.promises.writeFile(path, content, { mode: 0o755 });
};

/**
 * @param {string} path
 * @param {Uint8Array} content
 */
const write= async (path, content) => {
  return fs.promises.writeFile(path, content);
};

(async () => {
  await installChromeNativeMessagingHost({
    write,
    writeExecutable
  }, {
    platform: process.platform,
    env: process.env,
    nodePath,
  });
})();
