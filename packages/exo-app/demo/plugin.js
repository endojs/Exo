import { Far } from '@agoric/marshal';

export const startEndo = _endo => {
  return Far('Pingpong Table', {
    ping() {
      return 'pong';
    },
  });
};
harden(startEndo);
