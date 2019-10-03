# Pledger

Pledger provides a `Personal Ledger`: an API for exchanging and interacting with electronic rights.

## Caveats

**Note that this implementation is currently insecure and incomplete.  Do not use it for production until 1.0.0**

Communication via `@agoric/transport-ag-chain-cosmos` has not yet been secured: it is sending evaluable strings over the localhost WebSocket.

## Design

Pledger's notion of electronic rights directly uses Agoric's ERights Transfer Protocol (ERTP) layered on top of object capabilities (`ocaps`).

A running webpage can `link` a local Pledger session with distributed objects by calling:

```js
import { E } from '@agoric/eventual-send';
import { Pledger } from '@pledger/browser-extension';

// Set up the persistable references to remote objects.
import SturdyRef from '@pledger/sturdy-ref';
import TransportWebSocket from '@pledger/transport-websocket';
import TransportAgChainCosmos from '@agoric/transport-ag-chain-cosmos';
SturdyRef.register([TransportWebSocket, TransportAgChainCosmos]);

// URI for example dapp (bound to a chainID)
const dappSturdy = SturdyRef('ag-chain-cosmos:testnet-1.2.3:example#fe99');
const webSturdy = SturdyRef('wss://example.com/api/mystuff#0');

const commonName = 'my example exchange';
const dappC = E.C(Pledger)
  .M.linkWith(dappSturdy.getObj())
  .M.persistent(commonName);
const webC = E.C(Pledger)
  .M.linkWith(webSturdy.getObj())
  .M.persistent(commonName);
dappC
  .M.hello('Hi, dapp!')
  .P.then(msg => console.log('from dapp', msg));
webC
  .M.hello('Hi, web!')
  .P.then(msg => console.log('from web', msg));
```

If the web page wants a public key to identify a persistent session, it calls the `persistent(commonName)` method of a `linkWith` result.  Pledger's secure UI will prompt for a petname for the session, either a fresh one for a newly-generated keypair, or an existing one.  All the web page's session petnames will be scoped to the current origin and `commonName`.

Without `persistent()`, Pledger will not prompt, but will establish only a fresh ephemeral session.

## Pledger-recognized URIs

All Pledger URIs are used to establish a unique object-capability connection to the backend server.  The initial process is:

```js
E(Pledger).linkWith(receptionist) -> Promise<anonSession>

// Within Pledger:
anonSession = new HandledPromise((resolve, reject) => {
  E(receptionist).linkPledger(pledgerFacet).then(resolve).catch(reject);
});
```

If the web app wants to create or resume a persistent session, they can ask Pledger to do so:

```js
// On web page:
E(anonSession).persistent(commonName) // Promise<persistentSession>
// Within Pledger:
persistentSession = new HandledPromise((resolve, reject, resolveWithPresence) => {
  // If commonName has not already been used during this anonymous session, prompt the user
  // for the petname to give/reuse for the keypair.
  [pubKey, privKey] = ...;
  E(anonSession).resumeSessionWithKey(pubKey).then(({challenge, verifier}) => {
    const signedChallenge = sign(privKey, challenge);
    return E(verifier).sendResponse(signedChallenge);
  }).then(resolve).catch(reject);
});
```
