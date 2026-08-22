let collection = [];

export function setCollection(entries) {
  collection = entries;
}

export async function getCollection(name, filter) {
  if (name !== 'clanky') {
    throw new Error(`Neočekávaná kolekce: ${name}`);
  }

  return collection.filter((entry) => filter(entry));
}

export async function render() {
  return { Content: () => undefined };
}
