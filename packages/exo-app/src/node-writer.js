/* Adapts a Node.js stream to an Writer<Uint8Array>, where a writer stream is
 * modeled as a hybrid async iterator + generator.
 */

// @ts-check

/**
 * @template T
 * @template U
 * @template V
 * @typedef {import('./stream.js').Stream<T, U, V>} Stream
 */

/**
 * @template T
 * @typedef {import('./promise-kit.js').PromiseRecord<T>} PromiseRecord
 */
import { makePromiseKit } from './promise-kit.js';
import { pipe } from './stream.js';

/**
 * Adapts a Node.js writable stream to a JavaScript
 * async iterator of Uint8Array data chunks.
 * Back pressure emerges from awaiting on the promise
 * returned by `next` before calling `next` again.
 *
 * @param {NodeJS.WritableStream} output the destination Node.js writer
 * @param {string} [name] a debug name for stream errors
 * @returns {Stream<void, Uint8Array, void>}
 */
export function nodeWriter(output, name = '<unnamed stream>') {
  /**
   * @type {PromiseRecord<void>}
   */
  let drained = makePromiseKit();

  output.on('error', err => {
    drained.reject(new Error(`Cannot write ${name}: ${err.message}`));
  });

  output.on('close', () => {
    drained.resolve();
  });

  output.on('drain', () => {
    drained.resolve();
  });

  const [target, source] = pipe();

  async function pump() {
    try {
      const { value, done } = await source.next(undefined);
      if (done) {
        output.end();
      } else {
        if (!output.write(value)) {
          drained = makePromiseKit();
          await drained.promise;
        }
        pump();
        return;
      }
    } catch (error) {
      output.end();
    }
  }

  pump();

  return target;
}
