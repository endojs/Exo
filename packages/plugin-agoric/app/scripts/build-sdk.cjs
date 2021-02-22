#! /usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// process.env.GOPATH = `${process.cwd()}/gopath`;
// process.env.GO111MODULE = 'on';

function linkAllElectrons() {
  for (const [_src, dst] of [
    ['../../../../node_modules/electron', 'node_modules/electron'],
    ['../../../node_modules/electron', '../../app-electron/node_modules/electron']
  ]) {
    const src = `${__dirname}/../../../../node_modules/electron`;
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

console.log('rename morgan/node_modules/depd out of the way');
try {
  fs.renameSync('node_modules/morgan/node_modules/depd', 'node_modules/morgan/node_modules/depd.old');
} catch (e) {
  if (e.code !== 'ENOENT') {
    throw e;
  }
}

const pjson = require('@agoric/cosmic-swingset/package.json');
const goMod = `github.com/Agoric/agoric-sdk`;

// Note that the version.Name must be alphanumeric only.
// Otherwise, generated "os" keyrings on Ubuntu 20.04 can't be read.
const VersionName = pjson.name.replace(/[^A-Za-z0-9]/g, '');

function fetchGitHead(gitHead) {
  if (!gitHead) {
    throw Error(`Specify git head to fetch`);
  }

  console.log(`Go getting ${goMod}@${gitHead}`);
  const goGet = spawnSync('go', ['get', '-v', `${goMod}@${gitHead}`],
    {
      stdio: ['inherit', 'inherit', 'inherit'],
    });
  if (goGet.error) {
    throw goGet.error;
  }
}

const gitHead = process.argv[2] || pjson.gitHead;
fetchGitHead(gitHead);
const build_tags = 'ledger';
const build_tags_comma_sep = build_tags.replace(/ +/, ',');

console.log('Compiling bin/ag-cosmos-helper with Go...');
const ret = spawnSync('go', ['build', '-v', '-ldflags', `\
 -X github.com/cosmos/cosmos-sdk/version.Name=${VersionName}\
 -X github.com/cosmos/cosmos-sdk/version.AppName=ag-cosmos-server\
 -X github.com/cosmos/cosmos-sdk/version.Version=${pjson.version}\
 -X github.com/cosmos/cosmos-sdk/version.Commit=${gitHead}\
 -X "github.com/cosmos/cosmos-sdk/version.BuildTags=${build_tags_comma_sep}"\
`,
  '-buildmode=exe', '-tags', build_tags,
  '-o', `${__dirname}/../bin/ag-cosmos-helper`,
  `${goMod}/golang/cosmos/cmd/helper`
  ],
  {
    //	 cwd: css,
    stdio: ['inherit', 'inherit', 'inherit'],
  },
);

if (ret.error) {
  throw ret.error;
}



