import parseArgs from 'minimist';
import buildSourceBundle from './build-source-bundle';

export default async function upload(args) {
  const { _: paths } = parseArgs(args, {
    stopEarly: true,
  });
  if (paths.length !== 1) {
    console.error('You must specify exactly one PATH');
    return 1;
  }

  const { source } = await buildSourceBundle(paths[0]);
  console.log(`Would upload ${source}`);
  return 0;
}
