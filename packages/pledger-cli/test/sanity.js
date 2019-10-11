import { test } from 'tape-promise/tape';

import buildSourceBundle from '../lib/build-source-bundle';
import { evaluateProgram } from '@agoric/evaluate';

// TODO: remove .only when you have this test working
test('try bundling something', async t => {
  try {
    const { source, sourceMap } = await buildSourceBundle(
      `${__dirname}/../demo/contract-encouragementBot.js`,
    );
    const fullSource = `(${source}\n)\n${sourceMap}`;
    const harden = obj => obj;
    t.equal(
      evaluateProgram(fullSource, { harden })().default.start().encourageMe('Chuck'),
      `Chuck, you are awesome, keep it up!`,
      `encouragementBot evaluates`,
    );
  } catch (e) {
    t.isNot(e, e, 'unexpected exception');
  } finally {
    t.end();
  }
});
