const SHARP_MOCK_URL = 'test-generate-og:sharp-mock';
const GENERATOR_URL = new URL('./generate-og.mjs', import.meta.url).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'sharp' && context.parentURL === GENERATOR_URL) {
    return { url: SHARP_MOCK_URL, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url === SHARP_MOCK_URL) {
    return {
      format: 'module',
      shortCircuit: true,
      source: `
        import fs from 'node:fs';

        export default function sharp() {
          const pipeline = {
            resize() { return pipeline; },
            composite() { return pipeline; },
            jpeg() { return pipeline; },
            async toFile(output) {
              fs.writeFileSync(output, 'mock-sharp-output\\n');
            },
          };

          return pipeline;
        }
      `,
    };
  }

  return nextLoad(url, context);
}
