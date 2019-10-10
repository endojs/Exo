#! /usr/bin/env node

'use strict';

const erequire = require('esm')(module);

const { default: main } = erequire('../lib/cli');

main(process.argv.slice(2))
  .then(ret => {
    process.exit(ret);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
