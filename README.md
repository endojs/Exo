# Pledger

Pledger provides a `Personal Ledger`: an API for exchanging and interacting with object capabilities.

## Caveats

**Note that this implementation is currently insecure.  Do not use it for production until 1.0.0**

Communication with `ag-solo` has not yet been secured: it is sending evaluable strings over the localhost WebSocket.

WebSocket service URIs **do** receive cookies for their own domain.

## Design

Pledger's notion of electronic rights directly uses Agoric's ERights Transfer Protocol (ERTP) layered on top of object capabilities (`ocaps`).

A running webpage can `link` a local Pledger session with any number of backend services by calling:

```js
import { E } from '@agoric/eventual-send';
import { Pledger } from '@agoric/pledger-extension';
import { SturdyRef } from '@agoric/pactp';
import '@agoric/pactp-ag-chain-cosmos';
import '@agoric/pactp-websocket';

// URI for example dapp (bound to a chainID)
const dappSturdy = SturdyRef('ag-chain-cosmos:testnet-1.2.3:example#fe99');
const webSturdy = SturdyRef('wss://example.com/api/mystuff');

const commonName = 'my example exchange';
const dappC = E.C(Pledger)
  .M.linkWith(dappSturdy.getRcvr())
  .M.persistent(commonName);
const webC = E.C(Pledger)
  .M.linkWith(webSturdy.getRcvr())
  .M.persistent(commonName);
dappC
  .M.hello('Hi, dapp!')
  .M.then(msg => console.log('from dapp', msg));
webC
  .M.hello('Hi, web!')
  .M.then(msg => console.log('from web', msg));
```

If the `persistent(commonName)` method is called on a `linkWith` result, then the web page wants a public key to identify a persistent session.  Pledger's secure UI will prompt for a petname for the session, either a fresh one for a newly-generated keypair, or an existing one.  All the web page's session petnames will be scoped to the current origin and `commonName`.

Without `persistent()`, Pledger will not prompt, but will establish only a fresh ephemeral session.

## Pledger-recognized URIs

All Pledger URIs are used to establish a unique object-capability connection to the backend server.  The initial process is:

```js
E(Pledger).linkWith(remoteUri) -> Promise<anonSession>

// Within Pledger:
remoteFactory = getBootstrapObject(remoteUri)
anonSession = E(remoteFactory).linkPledger(pledgerFacet)
resolveToWebPage(anonSession)
```

If the web app wants to create or resume a persistent session, they can ask Pledger to do so:

```js
// On web page:
E(anonSession).persistent(commonName)
// Within Pledger:
// If commonName has not already be used during this anonymous session, prompt the user
// for the petname to give/reuse for the keypair.
persistentSession = E(anonSession).resumeSessionWithKey(sessionKey)
// On remote:
remotePersistentSession = E(pledgerFacet).sessionChallenge(sessionKey, challenge)
// Within Pledger:
persistentSession = E(anonSession).sessionResponse(sessionKey, response)
resolveToWebPage(persistentSession)
```

### ag-chain-cosmos

These URIs name an object in Agoric's zone in the Cosmos blockchain.  Eventual-send messages are marshalled directly to the object.

`ag-chain-cosmos` is only available when the Pledger Web Extension is installed in your browser and configured to run SwingSet.

### wss, ws

These URLs name a WebSocket interface, which communicates directly to the browser UI code via JSON messages.:

```js
const executor = (resolve, reject, resolveWithPresence) => {
  const ws = new WebSocket(uri);
  ws.addEventListener('open', () => {
    const exports = new Map();
    let nextExportId = 0;
    let handler;
    ws.addEventListener('message', ev => {
      capTPHandler(JSON.parse(ev.data));
    });

    const exportPledgerId = nextExportId ++;
    exports.set(exportPledgerId, pledgerBootstrap);
    ws.send(JSON.stringify({ type: 'PLEDGER_BOOTSTRAP', exportId }));
  });
};

const handledPromise = new HandledPromise(executor, unfulfilledHandler);
```
