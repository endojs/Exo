/* The "Exo Front Endo" is a web page that runs in an Electron window
 * and can run bundled scripts in a locked-down window with full access to the
 * document.
 *
 * Currently:
 * Exo only uses this Front Endo page to host its own Exo Console.
 *
 * Security:
 * Front Endo gives the application running in the page full access to the
 * document and consequently has all the powers of a web page.
 *
 * Design:
 * The "front endo" worker runs in a webpage of an Electron window.
 * Exo arranges for the Electron window to have a "preload" script,
 * "./front-endo-content.cjs".
 * The content script arranges for this, the page script, to have an "exo"
 * object that provides a bidirection message channel through the content
 * script back to the Exo main process.
 * The worker establishes a CapTP connection over this channel and provides the
 * Front Endo API.
 * With this API, Exo can inject a bundled program to run on the page.
 *
 * Further work:
 * If Front Endos were constrained to same-origin policy with a unique origin,
 * Exo could provide user interfaces to arbitrary installations.
 * If Front Endos could be further constrained strictly to object capability
 * rules, Exo could offer Front Endos to any application without consulting the
 * user for permission.
 * We could potentially arrange for a service worker to host arbitrary content
 * from a bundled application archive and limit access to the network, but true
 * confinement will be illusive as the DOM provides many avenues to the
 * network.
 * Front Endo also should also receive an Exo facet that would allow
 * it to ask follow-up requests of the Exo user, like revokable introduction to
 * other powers at runtime.
 */
/* global exo, document */

import '@agoric/eventual-send/shim.js';
import './lockdown.js';
import { makeCapTP } from '@agoric/captp';
import { Far } from '@agoric/marshal';
import { importBundle } from '@agoric/import-bundle';

const makeEndoFacet = (_endo, _grantedPowers) => {
  // Provide attenuated access to any granted powers.
  return harden({});
};

const send = message => {
  // console.log('frontendo->preendo', message);
  exo.send(message);
};

const { dispatch } = makeCapTP(
  'ExoFrontEndo',
  send,
  Far('ExoFrontEndo', {
    async importBundle(bundle, endo, grantedPowers) {
      const endowments = {
        document,
        assert,
        TextEncoder,
        TextDecoder,
        Date,
        Math,
        URL,
        console,
      };
      const namespace = await importBundle(bundle, {
        endowments,
      });
      const { startEndo } = namespace;
      if (typeof startEndo !== 'function') {
        throw new TypeError(
          `An Endo application must export startEndo(endo) from its entry module`,
        );
      }
      return startEndo(makeEndoFacet(endo, grantedPowers));
    },
  }),
);

exo.recv(message => {
  // console.log('preendo->frontendo', message);
  dispatch(message);
});
