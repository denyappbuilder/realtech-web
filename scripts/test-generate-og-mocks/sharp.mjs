import fs from 'node:fs';
import path from 'node:path';

const captureFile = path.join(process.cwd(), 'sharp-composite.svg');

export default function sharp() {
  const pipeline = {
    resize() {
      return pipeline;
    },
    composite(layers) {
      const svgLayer = layers.find(({ input }) => Buffer.isBuffer(input));
      if (!svgLayer) throw new Error('OG generátor nepředal SVG buffer do sharp.composite()');
      fs.writeFileSync(captureFile, svgLayer.input);
      return pipeline;
    },
    jpeg() {
      return pipeline;
    },
    async toFile(output) {
      fs.writeFileSync(output, 'sharp mock output\n');
    },
  };

  return pipeline;
}
