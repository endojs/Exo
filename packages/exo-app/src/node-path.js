/**
 * Electron applications contain an "Electron Helper" binary that is Node.js if
 * not in name.
 * Electron uses this to implement "child_process.fork", delegating to a
 * Node.js from an Electron main process.
 * Exo uses this to implement a Chrome extension native messaging host, and
 * needs to embed the path in either a shell script or batch file.
 * This utility allows us to discover the path by forking an responder program
 * that simply writes process.argv0 to stdout.
 */
import { fileURLToPath } from 'url';

const probePath = fileURLToPath(
  new URL('node-path-responder.js', import.meta.url),
);

export async function getNodePath(fork) {
  const child = fork(probePath, {
    stdio: ['ignore', 'pipe', 'ignore', 'ipc'],
  });

  const exited = new Promise(resolve => {
    child.on('exit', () => {
      resolve();
    });
  });

  let output = '';

  const stdout = child.stdio[1];

  stdout.setEncoding('utf-8');
  stdout.on('data', chunk => {
    output += chunk;
  });

  return exited.then(() => output.trimEnd());
}
