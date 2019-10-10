import upload from './upload';
import parseArgs from 'minimist';
import fs from 'fs';

let pjson;
async function packageJson() {
  if (pjson) {
    return pjson;
  }

  const pj = require.resolve('../package.json');
  const contents = await fs.promises.readFile(pj);
  pjson = JSON.parse(contents);
  return pjson;
}

export default async function cli(argv) {
  // TODO
  const { _: args, ...opts } = parseArgs(argv, {
    boolean: ['version', 'help'],
    stopEarly: true,
  });
  if (opts.version) {
    const pj = await packageJson();
    console.log(`Pledger CLI ${pj.version}`);
    return 0;
  }
  if (opts.help) {
    console.log(`\
Usage: ${argv[0]} [OPTION...] COMMAND [ARGS...]

--help       display this help and exit
--version    print version information

COMMAND is one of:

  upload     send files to the contractHost
`);
    return 0;
  }

  switch (args[0]) {
    case 'upload':
      return await upload(args.slice(1));

    case undefined:
      console.error(`You must specify a COMMAND`);
      return 1;

    default:
      console.error(`Unrecognized COMMAND '${args[0]}'`);
      return 1;
  }
}
