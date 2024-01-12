import { defineConfig } from 'vite';
import shit from '../src';

export default defineConfig({
  plugins: [
    shit({
      // when reach this much shit, abort building
      threshold: 100,
      // use recommended shit rules
      recommended: true,
      // define custom shit rules
      rules: {
        moment: 50,
        lodash: 50,
      },
    }),
  ],
});
