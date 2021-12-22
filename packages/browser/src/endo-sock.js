/* Infers the rendezvous path for the endo.sock file from the platform and
 * environment.
 */

export const whereEndoSock = (platform, env) => {
  if (platform === 'win32') {
    // Favoring local app data over roaming app data since I don't expect to be
    // able to listen on one host and connect on another.
    if (env.LOCALAPPDATA !== undefined) {
      return `${env.LOCALAPPDATA}\\Endo\\endo.sock`;
    }
    if (env.APPDATA !== undefined) {
      return `${env.APPDATA}\\Endo\\endo.sock`;
    }
    if (env.USERPROFILE !== undefined) {
      return `${env.USERPROFILE}\\AppData\\Endo\\endo.sock`;
    }
    if (env.HOMEDRIVE !== undefined && env.HOMEPATH !== undefined) {
      return `${env.HOMEDRIVE}${env.HOMEPATH}\\AppData\\Endo\\endo.sock`;
    }
  } else if (platform === 'darwin') {
    if (env.HOME !== undefined) {
      return `${env.HOME}/Library/Application Support/Endo/endo.sock`;
    }
  } else {
    if (env.XDG_RUNTIME_DIR !== undefined) {
      return `${env.XDG_RUNTIME_DIR}/endo/endo.sock`;
    }
    if (env.HOME !== undefined) {
      return `${env.HOME}/.run/endo/endo.sock`;
    }
  }
  return 'endo.sock';
};
