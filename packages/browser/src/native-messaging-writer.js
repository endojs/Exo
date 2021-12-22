// @ts-check

/**
 * @param {import('./stream.js').Writer<Uint8Array, undefined>} output
 * @returns {import('./stream.js').Writer<Uint8Array, undefined>}
 */
export function nativeMessageWriter(output) {
  return {
    async next(message) {
      // TODO check message length for 1MB limit.
      // Must allocate to support concurrent writes.
      const array8 = new Uint8Array(4 + message.byteLength);
      const array32 = new Uint32Array(array8.buffer, 0, 4); // Host byte order!
      array32[0] = message.byteLength;
      array8.set(message, 4);
      return output.next(array8);
    },
    async return() {
      return output.return(undefined);
    },
    async throw(error) {
      return output.throw(error);
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
}
