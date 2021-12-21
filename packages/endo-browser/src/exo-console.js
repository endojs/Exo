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
import { E } from '@agoric/eventual-send';

const stamp = message => {
  return `${new Date().toISOString()} ${message}`;
};

export const startEndo = endo => {

  const offerToInstallChromeExtension = () => {
    const install = document.createElement('button');
    install.innerText = 'Install Exo Chrome extension';
    const installP = document.createElement('p');
    installP.appendChild(install);
    document.body.appendChild(installP);

    install.onclick = () => {
      install.remove();
      installP.innerText = stamp('Installing Exo Chrome extension... ');
      endo.installChromeExtension().then(
          () => {
            const resultP = document.createElement('p');
            resultP.innerText = stamp('Installed Exo Chrome extension. ');
            const resultUl = document.createElement('ul');
            resultUl.appendChild(resultP);
            document.body.insertBefore(resultUl, install.nextSibling);
          },
          error => {
            console.group('Failed to install Exo Chrome extension:');
            console.error(error);
            console.groupEnd();

            installP.innerText = stamp(
              'Failed to install Exo Chrome extension. ',
            );

            offerToInstallChromeExtension();
          },
        );
    };
  };

  offerToInstallChromeExtension();

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
      p.innerText = stamp('[exo]: Received a request to create a back endo. ');
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
          q.innerText = stamp('You accepted. ');
          ul.appendChild(q);
        };

        deny.onclick = () => {
          answer({ granted: false });
          const q = document.createElement('p');
          q.innerText = stamp('You declined. ');
          ul.appendChild(q);
        };
      });
    },
  });
};
harden(startEndo);
