import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/endo-front-front.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'Endo',
    file: 'public/front-endo.js',
  },
  plugins: [resolve(), commonjs()],
};
