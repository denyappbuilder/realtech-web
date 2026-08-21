const sharpMock = new URL('./sharp.mjs', import.meta.url).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'sharp') {
    return { url: sharpMock, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}
