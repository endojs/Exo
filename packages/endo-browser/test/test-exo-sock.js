import test from 'ava';
import { whereExoSock } from '../src/exo-sock.js';

test('windows localappdata', t => {
  t.is(
    whereExoSock('win32', {
      LOCALAPPDATA: 'C:\\Users\\Alice\\AppData',
      APPDATA: 'IGNORE ME',
      USERPROFILE: 'IGNORE ME',
      HOMEDRIVE: 'IGNORE ME',
      HOMEPATH: 'IGNORE ME',
    }),
    'C:\\Users\\Alice\\AppData\\Exo\\exo.sock',
  );
});

test('windows appdata', t => {
  t.is(
    whereExoSock('win32', {
      APPDATA: 'C:\\Users\\Alice\\AppData\\Roaming',
      USERPROFILE: 'IGNORE ME',
      HOMEDRIVE: 'IGNORE ME',
      HOMEPATH: 'IGNORE ME',
    }),
    'C:\\Users\\Alice\\AppData\\Roaming\\Exo\\exo.sock',
  );
});

test('windows userprofile', t => {
  t.is(
    whereExoSock('win32', {
      USERPROFILE: 'C:\\Users\\Alice',
      HOMEDRIVE: 'IGNORE ME',
      HOMEPATH: 'IGNORE ME',
    }),
    'C:\\Users\\Alice\\AppData\\Exo\\exo.sock',
  );
});

test('windows homedrive and homepath', t => {
  t.is(
    whereExoSock('win32', {
      HOMEDRIVE: 'C:\\',
      HOMEPATH: 'Users\\Alice',
    }),
    'C:\\Users\\Alice\\AppData\\Exo\\exo.sock',
  );
});

test('windows fallback', t => {
  t.is(whereExoSock('win32', {}), 'exo.sock');
});

test('darwin', t => {
  t.is(
    whereExoSock('darwin', {
      HOME: '/Users/alice',
    }),
    '/Users/alice/Library/Application Support/Exo/exo.sock',
  );
});

test('darwin fallback', t => {
  t.is(whereExoSock('darwin', {}), 'exo.sock');
});

test('linux xdg runtime', t => {
  t.is(
    whereExoSock('linux', {
      XDG_RUNTIME_DIR: '/home/alice/.run',
      HOME: 'IGNORE ME',
    }),
    '/home/alice/.run/exo/exo.sock',
  );
});

test('linux xdg home', t => {
  t.is(
    whereExoSock('linux', {
      HOME: '/home/alice',
    }),
    '/home/alice/.run/exo/exo.sock',
  );
});

test('linux fallback', t => {
  t.is(whereExoSock('linux', {}), 'exo.sock');
});
