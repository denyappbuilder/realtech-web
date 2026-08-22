let failureAt = 0;
let conversions = [];

export function failWebpAt(index) {
  failureAt = index;
  conversions = [];
}

export function completedConversions() {
  return conversions.filter(({ completed }) => completed).map(({ index }) => index);
}

export const conversionFailure = new Error('mock WebP conversion failed');

export default function sharp() {
  const conversion = {
    index: conversions.length + 1,
    format: null,
    completed: false,
  };
  conversions.push(conversion);

  const pipeline = {
    autoOrient() {
      return pipeline;
    },
    resize() {
      return pipeline;
    },
    jpeg() {
      conversion.format = 'jpeg';
      return pipeline;
    },
    webp() {
      conversion.format = 'webp';
      return pipeline;
    },
    async toBuffer() {
      if (conversion.format === 'webp' && conversion.index === failureAt) {
        throw conversionFailure;
      }

      conversion.completed = true;
      return Buffer.from(`mock-derivative-${conversion.index}`, 'ascii');
    },
  };

  return pipeline;
}
