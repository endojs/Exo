/* The Exo Console provides a user interface for managing plugins running in
 * Exo.
 * The console surfaces requests from Endo subprocesses and external requests
 * from other applications on the system.
 * The Exo Console is an Exo Front Endo application that runs in hardened JS
 * compartments within an Electron window's page isolate.
 *
 * This is a very temporary stop-gap for a user interface, sufficient only for
 * demonstrating communication among all the Exo parts.
 */

/* global document */

import { Far } from '@agoric/marshal';

export const startEndo = endo => {
  return Far('ExoConsole', {
    async requestImportBundle(_hash, requestedPowers) {
      // TODO present program hash for out-of-band verification from the user.

      const grant = document.createElement('button');
      grant.innerText = 'Grant request to install a back endo';
      const grantLi = document.createElement('li');
      grantLi.appendChild(grant);
      const deny = document.createElement('button');
      deny.innerText = 'Deny request to install a back endo';
      const denyLi = document.createElement('li');
      denyLi.appendChild(deny);
      const ul = document.createElement('ul');
      ul.appendChild(grantLi);
      ul.appendChild(denyLi);

      const p = document.createElement('p');
      p.innerText = `${new Date().toISOString()} [exo]: Received a request to create a back endo. `;
      document.body.appendChild(p);
      document.body.appendChild(ul);

      return new Promise(resolve => {
        const answer = message => {
          resolve(message);
          denyLi.remove();
          grantLi.remove();
        };

        grant.onclick = () => {
          // TODO Extract petName from input.
          const petName = '<no-name>';
          answer({ granted: true, grantedPowers: requestedPowers, petName });
          const q = document.createElement('p');
          q.innerText = `${new Date().toISOString()} You accepted. `;
          ul.appendChild(q);
        };

        deny.onclick = () => {
          answer({ granted: false });
          const q = document.createElement('p');
          q.innerText = `${new Date().toISOString()} You declined. `;
          ul.appendChild(q);
        };
      });
    },
  });
};
harden(startEndo);
