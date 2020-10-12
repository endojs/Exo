import { ipcRenderer } from 'electron';

async function main() {

  let nextId = 0;
  const fork = args => {
    const id = nextId;
    nextId += 1;
    ipcRenderer.send('fork', { id, args });
  };

  window.addEventListener('DOMContentLoaded', () => {
    const runCli = document.querySelector('#run-cli');
    const runSolo = document.querySelector('#run-solo');

    runSolo.addEventListener('click', () => fork(['ag-solo', 'to-solo']));
    runCli.addEventListener('click', () => fork(['agoric-cli', 'to-cli']));
  });
}

export default main;
