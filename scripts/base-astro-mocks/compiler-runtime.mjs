export * from 'astro/compiler-runtime';

export function createMetadata(filename, metadata) {
  return { filename, ...metadata };
}
