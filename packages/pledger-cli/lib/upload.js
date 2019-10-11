import parseArgs from 'minimist';
import WebSocket from 'ws';
import { E } from '@agoric/eventual-send';
import { getCapTP } from '@pledger/mini-captp';
import buildSourceBundle from './build-source-bundle';

const DEFAULT_AG_SOLO = 'ws://localhost:8000/captp';

const makePromise = () => {
  const pr = {};
  pr.p = new Promise((resolve, reject) => {
    pr.res = resolve;
    pr.rej = reject;
  });
  return pr;
};

const sendJSON = (ws, obj) => {
  if (ws.readyState !== ws.OPEN) {
    return;
  }
  ws.send(JSON.stringify(obj));
};

export default async function upload(args) {
  const { _: paths, 'ag-solo': agSolo } = parseArgs(args, {
    stopEarly: true,
    default: {
      'ag-solo': DEFAULT_AG_SOLO,
    },
  });
  if (paths.length !== 1) {
    console.error('You must specify exactly one PATH');
    return 1;
  }

  const { source, moduleFormat } = await buildSourceBundle(paths[0]);
  // console.log(`Uploading ${source}`);

  const ws = new WebSocket(agSolo);
  const exit = makePromise();
  ws.on('open', () => {
    const [handler, bootstrap] = getCapTP('upload', obj => sendJSON(ws, obj));
    ws.on('message', data => {
      console.log(data);
      try {
        const obj = JSON.parse(data);
        if (obj.type === 'CTP_ERROR') {
          throw obj.error;
        }
        handler[obj.type](obj);
      } catch (e) {
        console.log('server error processing message', data, e);
        exit.rej(e);
      }
    });
    E.C(bootstrap())
      .G.contractHost.M.uploadContract({ source, moduleFormat })
      .P.then(res => {
        console.log('upload succeeded', res);
        exit.res(0);
      })
      .catch(exit.rej);
  });
  ws.on('close', (_code, _reason) => {
    console.log('connection closed');
    exit.res(1);
  });
  return exit.p;
}
