const optimizeImagesPathname = new URL('./optimize-images.mjs', import.meta.url).pathname;
const sharpMockUrl = new URL('./test-optimize-images-atomic-mocks/sharp.mjs', import.meta.url).href;

export async function resolve(specifier, context, nextResolve) {
  if (
    specifier === 'sharp'
    && context.parentURL
    && new URL(context.parentURL).pathname === optimizeImagesPathname
  ) {
    return { url: sharpMockUrl, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}
