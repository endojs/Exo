/**
 * This program writes out the name of the Node.js executable.
 * This is handy because Electron is bundled with a Node.js executable going by
 * the name "Electron Helper" which we can use to run Chrome Extension a native
 * messaging host without relying on a system-wide installation of Node.js and
 * can be sure of the version of Node.js deployed.
 * This program gets run by calling child_process.fork in the Electron main
 * process.
 */
console.log(process.argv0);
