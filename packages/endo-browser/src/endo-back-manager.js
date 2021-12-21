/* Exo spawns Back Endo processes that can run arbitrary bundled programs in a
 * hardened JavaScript environment with limited capabilities.
 * This manager module runs in the main Exo process to create Back Endo
 * processes.
 * The Back Endo communicates with the Exo process on the third file descriptor
 * using CapTP over JSON over netstring protocol.
 */
import { resolve as importMetaResolve } from 'import-meta-resolve';
import { makeCapTPConnection } from './captp-conn.js';

export async function spawnBackEndo(fork, name, near, options = {}) {
  const backEndoJavaScriptPath = new URL(
    await importMetaResolve('./endo-back-worker.js', import.meta.url),
  ).pathname;
  const child = fork(backEndoJavaScriptPath, {
    stdio: ['ignore', 'inherit', 'inherit', 'pipe', 'ipc'],
  });

  const { getBootstrap, drained, finalize } = makeCapTPConnection(
    name,
    child.stdio[3],
    near,
    options,
  );

  const exited = new Promise(resolve => {
    child.on('exit', () => {
      resolve();
    });
  });

  const kill = () => {
    child.kill();
    finalize();
  };

  return {
    getBootstrap,
    exited,
    drained,
    kill,
  };
}
