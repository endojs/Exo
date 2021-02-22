import { fork } from 'child_process';
import path from 'path';
import { makeNotifierKit } from '@agoric/notifier';
import { getAccessToken } from '@agoric/cosmic-swingset/lib/ag-solo/access-token.js';

export const bootPlugin = ({ getState, setState }) => {
  const idToChild = new Map();
  return harden({
    hello(nickname) {
      return `Hello again, ${nickname}!`;
    },
    getAccessToken,
    fork(id, progname, ...restArgs) {
      if (idToChild.has(id)) {
        return idToChild.get(id);
      }
      const base = path.basename(progname);
      const entrypoint = path.join(__dirname, 'forks', `${base}.cjs`);
      const cp = fork(entrypoint, restArgs, { stdio: 'pipe' });

      const consoleData = [];
      const { notifier, updater } = makeNotifierKit([...consoleData]);

      const addToConsole = (source, data) => {
        const obj = {
          type: source,
          data,
        };
        consoleData.push(obj);
        updater.updateState([...consoleData]);
      };

      cp.on('close', (code, signal) => {
        idToChild.delete(id);
        addToConsole('exit', { code, signal });
        // Allow the finisher to freeze the data.
        updater.finish([...consoleData]);
      });

      cp.stderr.on('data', chunk => addToConsole('stderr', chunk.toString('latin1')));
      cp.stdout.on('data', chunk => addToConsole('stdout', chunk.toString('latin1')));
      const child = harden({
        kill(sig = 'SIGTERM') {
          process.kill(cp.pid, sig);
        },
        write(data) {
          return new Promise((resolve, reject) => {
            addToConsole('stdin', data);
            cp.stdin.write(data, err => {
              if (err) {
                console.error('have error', err);
                return reject(err);
              }
              return resolve();
            });
          });
        },
        getNotifier() {
          return notifier;
        },
      });
      idToChild.set(id, child);
      return child;
    },
    getUiIndex() {
      return path.join(__dirname, '../../plugin-agoric-ui/public/index.html');
    },
    dispose() {
      for (const child of idToChild.values()) {
        E(child).kill();
      }
    }
  });
};
