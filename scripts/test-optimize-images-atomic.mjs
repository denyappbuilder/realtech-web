import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { register } from 'node:module';
import test from 'node:test';

import {
  completedConversions,
  conversionFailure,
  failWebpAt,
} from './test-optimize-images-atomic-mocks/sharp.mjs';

register('./test-optimize-images-atomic-loader.mjs', import.meta.url);

const { optimizeImages } = await import('./optimize-images.mjs?atomic-failure-test');
const derivativeNames = ['cover-640.jpg', 'cover.webp', 'cover-640.webp'];

function derivativePaths(dir) {
  return derivativeNames.map((name) => path.join(dir, name));
}

test('pozdní selhání WebP konverze zachová atomicky všechny výstupy', async (t) => {
  for (const failAt of [2, 3]) {
    await t.test(`selhání ${failAt}. derivace`, async (t) => {
      for (const initialState of ['missing', 'existing']) {
        await t.test(`výstupy ${initialState}`, async (t) => {
          const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'optimize-images-atomic-'));
          t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
          fs.writeFileSync(path.join(dir, 'cover.jpg'), 'mock source', 'ascii');

          const outputs = derivativePaths(dir);
          const originalContents = outputs.map((output, index) => {
            const contents = Buffer.from(`original-output-${index + 1}`, 'ascii');
            if (initialState === 'existing') fs.writeFileSync(output, contents);
            return contents;
          });

          failWebpAt(failAt);
          await assert.rejects(optimizeImages(dir), (error) => error === conversionFailure);
          assert.deepEqual(
            completedConversions(),
            Array.from({ length: failAt - 1 }, (_, index) => index + 1),
            'všechny dřívější buffery musí být před selháním připravené',
          );

          for (const [index, output] of outputs.entries()) {
            if (initialState === 'missing') {
              assert.equal(fs.existsSync(output), false, `${path.basename(output)} nesmí vzniknout`);
            } else {
              assert.deepEqual(
                fs.readFileSync(output),
                originalContents[index],
                `${path.basename(output)} se nesmí přepsat`,
              );
            }
          }
        });
      }
    });
  }
});
