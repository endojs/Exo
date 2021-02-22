#! /usr/bin/env node
const path = require('path');
const fs = require('fs');

function linkAllElectrons() {
  for (const [_src, dst] of [
    ['../../../../node_modules/electron', 'node_modules/electron'],
  ]) {
    const src = `${__dirname}/../../../node_modules/electron`;
    console.log('linking', src, 'to', dst);
    try {
      fs.unlinkSync(dst);
    } catch (e) {
      if (e.code !== 'ENOENT') {
        throw e;
      }
    }
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.symlinkSync(src, dst, 'junction');
  }
}
linkAllElectrons();

