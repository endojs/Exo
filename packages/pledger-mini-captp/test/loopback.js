import { test } from 'tape-promise/tape';
import { E } from '@agoric/eventual-send';
import harden from '@agoric/harden';
import { getCapTP } from '../lib/pledger-mini-captp';

// TODO: remove .only when you have this test working
test('try loopback captp', async t => {
  try {
    let right;
    const left = getCapTP('left', obj => {
      console.log('toRight', obj);
      right[0][obj.type](obj);
    });
    right = getCapTP(
      'right',
      obj => {
        console.log('toLeft', obj);
        left[0][obj.type](obj);
      },
      harden({
        encourager: {
          encourage(name) {
            return `good work, ${name}`;
          },
        },
      }),
    );
    const rightRef = left[1]();
    const comment = await E.C(rightRef).G.encourager.M.encourage('buddy').P;
    t.equal(comment, 'good work, buddy');
  } catch (e) {
    t.isNot(e, e, 'unexpected exception');
  } finally {
    t.end();
  }
});
