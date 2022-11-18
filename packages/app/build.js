import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const sh = async (cwd, command, ...args) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { cwd, stdio: ['inherit', 'inherit', 'inherit'] });
  child.on('error', reject);
  child.on('exit', resolve);
});

const cp = async (a, b) => fs.copyFile(
  path.resolve(a),
  path.join(b, path.basename(a))
);

// The output target is passed by the build tool.
// It's where we will write all of our files.
const target = path.resolve(process.argv[2]);

if (target === undefined) {
  console.error('  - Did not receive the build target path as an argument')
  process.exit(1)
}

// The input source is the directory containing this file.
const source = path.dirname(process.argv[1]);

// We coordinate the version of Node.js we're using between this and the
// postinstall script (scripts/get-node.sh) using node.json.
const { version } = JSON.parse(await fs.readFile(`${source}/node.json`, 'utf8'));

async function main() {
  let ext = '';
  let node = '';

  switch (process.platform) {
    case 'win32':
      node = `node-v${version}-win-x64/node.exe`;
      ext = 'ico';
      await cp(`../../art/endo.png`, target);
      break;
    case 'linux':
      node = `node-v${version}-linux-x64/bin/node`;
      ext = 'png';
      break
    case 'darwin':
      node = `node-v${version}-darwin-x64/bin/node`;
      ext = 'icns';
  }

  await cp('index.html', target);
  await cp(`../../art/gen/icon.${ext}`, target); // app icon
}
 
main();
