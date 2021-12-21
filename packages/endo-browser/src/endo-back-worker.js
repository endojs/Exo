/* Exo spawns Back Endo processes that can run arbitrary bundled programs in a
 * hardened JavaScript environment with limited capabilities.
 * This worker application runs in Exo child processes spawned from the main
 * process by the Back Endo manager.
 * The Exo main process communicates with the child process on the third file
 * descriptor using CapTP over JSON over netstring protocol.
 */
import fs from 'fs';
import 'ses';
import '@agoric/eventual-send/shim.js';
import './lockdown.js';
import { makeCapTP } from '@agoric/captp';
import { Far } from '@agoric/marshal';
import { importBundle } from '@agoric/import-bundle';
import { netstringReader, netstringWriter } from '@endo/netstring';
import { jsonReader } from './json-reader.js';
import { jsonWriter } from './json-writer.js';
import { nodeWriter } from './node-writer.js';

function sink(error) {
  console.error(error);
}

const fileReader = fs.createReadStream(null, { fd: 3 });
const fileWriter = fs.createWriteStream(null, { fd: 3 });

const reader = jsonReader(netstringReader(fileReader));
const writer = jsonWriter(netstringWriter(nodeWriter(fileWriter)));

const send = message => {
  writer.next(message);
};

const makeEndoFacet = (_endo, _grantedPowers) => {
  // Provide attenuated access to any granted powers.
  return harden({});
};

const { dispatch } = makeCapTP(
  'ExoBackEndo',
  send,
  Far('ExoBackEndo', {
    async importBundle(bundle, endo, grantedPowers) {
      const endowments = {
        assert,
        TextEncoder,
        TextDecoder,
        URL,
        console,
      };
      const namespace = await importBundle(bundle, {
        endowments,
      });
      const { startEndo } = namespace;
      if (typeof startEndo !== 'function') {
        throw new TypeError(
          `An Endo application must export startEndo(endo) from its entry module`,
        );
      }
      return startEndo(makeEndoFacet(endo, grantedPowers));
    },
  }),
);

(async () => {
  for await (const message of reader) {
    dispatch(message);
  }
})().catch(sink);
