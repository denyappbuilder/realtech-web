import fs from 'node:fs';

const stateFile = process.env.GENERATE_OG_SHARP_STATE;
if (!stateFile) throw new Error('Chybí GENERATE_OG_SHARP_STATE pro mock sharp');

const calls = [];
writeState();

function writeState() {
  fs.writeFileSync(stateFile, JSON.stringify({ calls }, null, 2));
}

export default function sharp(input) {
  const call = { input, svg: null, output: null };
  calls.push(call);

  const chain = {
    resize() {
      return chain;
    },
    composite(layers) {
      call.svg = layers[0].input.toString('utf8');
      return chain;
    },
    jpeg() {
      return chain;
    },
    async toFile(output) {
      call.output = output;
      fs.writeFileSync(output, 'sharp mock output\n');
      writeState();
    },
  };

  return chain;
}
