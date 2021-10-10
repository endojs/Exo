/* Infers the rendezvous path for the exo.sock file from the platform and
 * environment.
 */

export const whereExoSock = (platform, env) => {
  if (platform === 'win32') {
    // Favoring local app data over roaming app data since I don't expect to be
    // able to listen on one host and connect on another.
    if (env.LOCALAPPDATA !== undefined) {
      return `${env.LOCALAPPDATA}\\Exo\\exo.sock`;
    }
    if (env.APPDATA !== undefined) {
      return `${env.APPDATA}\\Exo\\exo.sock`;
    }
    if (env.USERPROFILE !== undefined) {
      return `${env.USERPROFILE}\\AppData\\Exo\\exo.sock`;
    }
    if (env.HOMEDRIVE !== undefined && env.HOMEPATH !== undefined) {
      return `${env.HOMEDRIVE}${env.HOMEPATH}\\AppData\\Exo\\exo.sock`;
    }
  } else if (platform === 'darwin') {
    if (env.HOME !== undefined) {
      return `${env.HOME}/Library/Application Support/Exo/exo.sock`;
    }
  } else {
    if (env.XDG_RUNTIME_DIR !== undefined) {
      return `${env.XDG_RUNTIME_DIR}/exo/exo.sock`;
    }
    if (env.HOME !== undefined) {
      return `${env.HOME}/.run/exo/exo.sock`;
    }
  }
  return 'exo.sock';
};
