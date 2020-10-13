import { fork } from 'child_process';
import path from 'path';

export const bootPlugin = ({ getState, setState }) => {
  return harden({
    hello(nickname) {
      return `Hello, ${nickname}!`;
    },
    fork(progname, ...restArgs) {
      const base = path.basename(progname);
      const entrypoint = path.join(__dirname, 'forks', `${base}.cjs`);
      const cp = fork(entrypoint, restArgs, { detached: true });
    },
    getUiIndex() {
      return path.join(__dirname, '../../ui/public/index.html');
    },
  });
};
