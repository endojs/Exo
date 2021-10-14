/* global process */

import '@agoric/babel-standalone';
import 'ses';
import '@agoric/eventual-send/shim.js';
import '../src/lockdown.js';
import net from 'net';
import { E } from '@agoric/eventual-send';
import { resolve as importMetaResolve } from 'import-meta-resolve';
import bundleSource from '@agoric/bundle-source';
import { makeCapTPConnection } from '../src/captp-conn.js';
import { whereExoSock } from '../src/exo-sock.js';

function sink(error) {
  console.error(error);
  process.exitCode = process.exitCode || -1;
  process.exit();
}

const conn = net.connect(whereExoSock(process.platform, process.env));
conn.on('connect', () => {
  (async () => {
    const url = await importMetaResolve('./plugin.js', import.meta.url);
    const path = new URL(url).pathname;
    const bundle = await bundleSource(path);

    const { drained, finalize, getBootstrap } = makeCapTPConnection(
      'Exo',
      conn,
    );
    drained.catch(sink);
    try {
      const exo = getBootstrap();
      const instance = E(exo).importBundle(bundle);
      const api = E(instance).getAPI();
      console.log('ping->');
      const pong = await E(api).ping();
      console.log('<-pong', pong);
    } finally {
      finalize().catch(sink);
    }
  })().catch(sink);
});
