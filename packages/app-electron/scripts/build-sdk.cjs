#! /usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

const css = path.dirname(require.resolve('@agoric/cosmic-swingset/package.json'));
const pjson = require('@agoric/cosmic-swingset/package.json');

console.log('Compiling bin/ag-cosmos-helper with Go...');
const ret = spawnSync('go', ['build', '-v', '-ldflags',`\
 -X github.com/cosmos/cosmos-sdk/version.Name=${pjson.name}\
 -X github.com/cosmos/cosmos-sdk/version.AppName=ag-chain-cosmos\
 -X github.com/cosmos/cosmos-sdk/version.Version=${pjson.version}`,
 '-o', `${__dirname}/../bin/ag-cosmos-helper`,
 './cmd/ag-cosmos-helper'],
 { cwd: css, stdio: ['inherit', 'inherit', 'inherit'] },
);

if (ret.error) {
  throw ret.error;
}
