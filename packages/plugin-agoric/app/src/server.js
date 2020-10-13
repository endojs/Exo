import { fork } from 'child_process';
import path from 'path';
import { makeNotifierKit } from '@agoric/notifier';

export const bootPlugin = ({ getState, setState }) => {
  return harden({
    hello(nickname) {
      return `Hello, ${nickname}!`;
    },
    fork(progname, ...restArgs) {
      const base = path.basename(progname);
      const entrypoint = path.join(__dirname, 'forks', `${base}.cjs`);
      const cp = fork(entrypoint, restArgs, { detached: true, stdio: 'pipe' });

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
        addToConsole('exit', { code, signal });
        // Allow the finisher to freeze the data.
        updater.finish([...consoleData]);
      });

      cp.stderr.on('data', chunk => addToConsole('stderr', chunk.toString('latin1')));
      cp.stdout.on('data', chunk => addToConsole('stdout', chunk.toString('latin1')));
      return harden({
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
    },
    getUiIndex() {
      return path.join(__dirname, '../../ui/public/index.html');
    },
  });
};
