const generatorUrl = new URL('../generate-og.mjs', import.meta.url).href;
const sharpMockUrl = new URL('./sharp.mjs', import.meta.url).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'sharp' && context.parentURL === generatorUrl) {
    return { url: sharpMockUrl, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}
