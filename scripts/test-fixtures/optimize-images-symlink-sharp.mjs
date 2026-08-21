const calls = [];

function sharp(source) {
  const call = {
    source: String(source),
    operations: [],
  };
  calls.push(call);

  const pipeline = {
    autoOrient() {
      call.operations.push(['autoOrient']);
      return pipeline;
    },
    resize(width, height) {
      call.operations.push(['resize', width, height]);
      return pipeline;
    },
    jpeg(options) {
      call.operations.push(['jpeg', options]);
      return pipeline;
    },
    webp(options) {
      call.operations.push(['webp', options]);
      return pipeline;
    },
    async toBuffer() {
      return Buffer.from(JSON.stringify(call));
    },
  };

  return pipeline;
}

export function sharpCalls() {
  return calls.map(({ source, operations }) => ({
    source,
    operations: operations.map((operation) => [...operation]),
  }));
}

export function resetSharpCalls() {
  calls.length = 0;
}

export default sharp;
