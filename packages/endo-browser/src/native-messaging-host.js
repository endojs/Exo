/* This is a Chrome extension native message host that communicates bridges
 * messages between Chrome and Exo.
 *
 * Chrome speaks JSON over 32-bit host-endian length-prefixed messages
 * and Exo speaks the netstring protocol (delimited ASCII decimal
 * length-prefixed messages).
 * So, the native message host aborsbs responsibility for the protocol
 * conversion.
 */

// @ts-check

/* global process */

import 'ses';
import net from 'net';
import { netstringReader } from '@endo/netstring/reader.js';
import { netstringWriter } from '@endo/netstring/writer.js';
import { nodeWriter } from './node-writer.js';
import { whereExoSock } from './exo-sock.js';
import { nativeMessageReader } from './native-messaging-reader.js';
import { nativeMessageWriter } from './native-messaging-writer.js';

/**
 * @param {Error} error
 */
const sink = error => {
  console.error(error);
};

/**
 * @param {import('./stream.js').Writer<Uint8Array, void>} writer
 * @param {import('./stream.js').Reader<Uint8Array, void>} reader
 */
const pump = async (writer, reader) => {
  try {
    for await (const message of reader) {
      await writer.next(message);
    }
  } finally {
    await writer.return();
  }
};

const sockPath = whereExoSock(process.platform, process.env);

const conn = net.connect(sockPath);
conn.on('connect', () => {
  console.error('endo native messaging host connection established');
  // Bridge conn <-> stdio.

  const chromeToExo = (async () => {
    const reader = nativeMessageReader(process.stdin);
    const writer = netstringWriter(nodeWriter(conn));
    return pump(writer, reader);
  });

  const exoToChrome = (async () => {
    const reader = netstringReader(conn);
    const writer = nativeMessageWriter(nodeWriter(process.stdout));
    return pump(writer, reader);
  });

  exoToChrome().catch(sink);
  chromeToExo().catch(sink);

  conn.on('close', () => {
    console.error('endo native messaging host connection closed');
  });
});

conn.on('error', error => {
  console.error(error);
  process.exit(1);
});

process.on('exit', () => {
  console.error('endo native messaging host exits');
});
