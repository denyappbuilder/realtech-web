const optimizeImagesUrl = new URL('../optimize-images.mjs', import.meta.url).href;
const sharpMockUrl = new URL('./optimize-images-symlink-sharp.mjs', import.meta.url).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'sharp' && context.parentURL === optimizeImagesUrl) {
    return { url: sharpMockUrl, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}
