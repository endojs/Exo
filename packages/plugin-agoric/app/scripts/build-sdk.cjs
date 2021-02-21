#! /usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

for (const [src, dst] of [
	['../../../../node_modules/electron', 'node_modules/electron'],
	['../../../node_modules/electron', '../../app-electron/node_modules/electron']
]) {
	console.log('linking', src, 'to', dst);
	try {
		fs.unlinkSync(dst);
	} catch (e) {
		if (e.code !== 'ENOENT') {
			throw e;
		}
	}
	fs.symlinkSync(src, dst, 'junction');
}

console.log('rename morgan/node_modules/depd out of the way');
try {
  fs.renameSync('node_modules/morgan/node_modules/depd', 'node_modules/morgan/node_modules/depd.old');
} catch (e) {
  if (e.code !== 'ENOENT') {
   throw e;
  }
}

const css = path.dirname(require.resolve('@agoric/cosmic-swingset/package.json'));
const pjson = require('@agoric/cosmic-swingset/package.json');

// Note that the version.Name must be alphanumeric only.
// Otherwise, generated "os" keyrings on Ubuntu 20.04 can't be read.
const VersionName = pjson.name.replace(/[^A-Za-z0-9]/g, '');

console.log('Compiling bin/ag-cosmos-helper with Go...');
const ret = spawnSync('go', ['build', '-v', '-ldflags',`\
 -X github.com/cosmos/cosmos-sdk/version.Name=${VersionName}\
 -X github.com/cosmos/cosmos-sdk/version.AppName=ag-chain-cosmos\
 -X github.com/cosmos/cosmos-sdk/version.Version=${pjson.version}`,
 '-buildmode=exe',
 '-o', `${__dirname}/../bin/ag-cosmos-helper`,
 'github.com/Agoric/agoric-sdk/golang/cosmos/cmd/helper'],
 {
//	 cwd: css,
	 stdio: ['inherit', 'inherit', 'inherit'],
 },
);

if (ret.error) {
  throw ret.error;
}
