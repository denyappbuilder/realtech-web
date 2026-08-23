import { register } from 'node:module';

register('./test-homepage-loader.mjs', import.meta.url);
