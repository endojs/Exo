/* A thin wrapper for making promises and their controller functions.
 */

// @ts-check
/// <reference types="ses"/>

/**
 * @template T
 * @typedef {{
 *   resolve(value?: T | Promise<T>): void,
 *   reject(error: Error): void,
 *   promise: Promise<T>
 * }} PromiseKit
 */

/**
 * @template T
 * @returns {PromiseKit<T>}
 */
export function makePromiseKit() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  assert(resolve !== undefined);
  assert(reject !== undefined);
  return { promise, resolve, reject };
}
