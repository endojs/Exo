import test from 'ava';
import { shellQuote as quote } from '../src/quote-shell.js';

// https://github.com/substack/node-shell-quote/blob/master/test/quote.js
test('shellQuote', t => {
  t.is(quote('a'), 'a');
  t.is(quote('b c'), "'b c'");
  t.is(quote("it's"), '"it\'s"');
  t.is(quote('$'), '\\$');
  t.is(quote('`'), '\\`');
  t.is(quote('\\'), '\\\\');
  t.is(quote(''), "''");
  t.is(quote('a\nb'), "'a\nb'");
  t.is(quote(' #(){}*|][!'), "' #(){}*|][!'");
  t.is(quote('X#(){}*|][!'), 'X\\#\\(\\)\\{\\}\\*\\|\\]\\[\\!');
  t.is(quote('a\n#\nb'), "'a\n#\nb'");
  t.is(quote('><;{}'), '\\>\\<\\;\\{\\}');
  t.is(quote('a\\x'), 'a\\\\x');
});
