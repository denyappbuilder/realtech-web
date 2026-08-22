const state = {
  entries: [],
};

export function setCollection(entries) {
  state.entries = entries;
}

export function resetAudioPageMocks() {
  state.entries = [];
}

export async function getCollection(name, filter) {
  if (name !== 'clanky') {
    throw new Error(`Neočekávaná kolekce: ${name}`);
  }
  return filter ? state.entries.filter(filter) : state.entries;
}

export async function render() {
  return { Content: () => null };
}
