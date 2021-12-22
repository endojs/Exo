// @ts-check

/**
 * @param {Iterable<Uint8Array> | AsyncIterable<Uint8Array>} input
 * @param {string=} name
 * @param {number=} capacity
 * @returns {import('./stream.js').Stream<Uint8Array, undefined, undefined>} input
 */
export async function* nativeMessageReader(
  input,
  name = '<unknown>',
  capacity = 1024,
) {
  let length = 0;
  let array8 = new Uint8Array(capacity);
  let array32 = new Uint32Array(array8.buffer, 0, 4); // Host byte order!
  let offset = 0;

  for await (const chunk of input) {
    if (length + chunk.byteLength >= capacity) {
      while (length + chunk.byteLength >= capacity) {
        capacity *= 2;
      }
      const replacement = new Uint8Array(capacity);
      replacement.set(array8, 0);
      array8 = replacement;
      array32 = new Uint32Array(array8.buffer, 0, 4);
    }
    array8.set(chunk, length);
    length += chunk.byteLength;

    let drained = false;
    while (!drained && length > 4) {
      const messageLength = 4 + array32[0];
      if (messageLength <= length) {
        // Must allocate to support concurrent reads.
        yield array8.slice(4, messageLength);
        // Shift
        array8.copyWithin(0, messageLength);
        length -= messageLength;
        offset += messageLength;
      } else {
        drained = true;
      }
    }
  }

  if (length > 0) {
    throw new Error(
      `Unexpected dangling message at offset ${offset} of ${name}`,
    );
  }
}
