/* Copies a built version of SES into the public documents directory
 * for Exo's Front Endo Electron windows.
 */

import fs from 'fs';
import { resolve as importMetaResolve } from 'import-meta-resolve';
import { fileURLToPath } from 'url';

(async () => {
  const readUrl = await importMetaResolve('ses', import.meta.url);
  const writeUrl = new URL('../public/ses.js', import.meta.url).toString();
  const readPath = fileURLToPath(readUrl);
  const writePath = fileURLToPath(writeUrl);
  return fs.promises.copyFile(readPath, writePath);
})().catch(console.error);
