/* Provides a thin wrapper for CapTP, adapting Node.js Socket instances to JSON
 * over netstring streams.
 */
import { makeCapTP } from '@agoric/captp';
import { netstringReader } from '@endo/netstring/reader.js';
import { netstringWriter } from '@endo/netstring/writer.js';
import { nodeWriter } from './node-writer.js';
import { jsonWriter } from './json-writer.js';
import { jsonReader } from './json-reader.js';

function makeCapTPMessageStreams(name, writer, reader, near) {
  // TODO cancellation context
  const { dispatch, getBootstrap, abort } = makeCapTP(name, writer.next, near);

  const drained = (async () => {
    for await (const message of reader) {
      dispatch(message);
    }
  })();

  return {
    getBootstrap,
    drained,
    finalize() {
      abort();
      return writer.return();
    },
  };
}

export function makeCapTPConnection(name, conn, near) {
  const writer = jsonWriter(netstringWriter(nodeWriter(conn)));
  const reader = jsonReader(netstringReader(conn));
  return makeCapTPMessageStreams(name, writer, reader, near);
}
