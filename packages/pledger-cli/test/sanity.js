import { test } from 'tape-promise/tape';

import buildSourceBundle from '../lib/build-source-bundle';
import { evaluateProgram } from '@agoric/evaluate';

// TODO: remove .only when you have this test working
test.only('try bundling something', async t => {
  try {
    const { source, sourceMap } = await buildSourceBundle('../lib/cli.js');
    const fullSource = `(${source}\n)\n${sourceMap}`;
    t.equal(evaluateProgram(fullSource)().default([1, 2]), 2, `program evaluates`);
  } catch (e) {
    t.isNot(e, e, 'unexpected exception');
  } finally {
    t.end();
  }
});
