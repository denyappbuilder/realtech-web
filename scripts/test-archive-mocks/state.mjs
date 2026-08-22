const initialState = () => ({
  collection: [],
  collectionCalls: [],
});

let state = initialState();

export function resetArchiveMocks() {
  state = initialState();
}

export function setCollection(collection) {
  state.collection = collection;
}

export function getMockState() {
  return state;
}

export async function getCollection(name, filter) {
  state.collectionCalls.push({ name, filter });
  return state.collection.filter((entry) => filter(entry));
}
