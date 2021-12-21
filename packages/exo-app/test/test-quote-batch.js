import test from 'ava';
import { batchQuote } from '../src/quote-batch.js';

test('quote', t => {
  t.is(
    batchQuote('malicious argument" & whoami'),
    '^"malicious argument\\^" ^& whoami^"',
  );
});
