const initialState = () => ({
  collection: [],
  collectionCalls: [],
});

let state = initialState();

export function resetTemataMocks() {
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
  return filter ? state.collection.filter((entry) => filter(entry)) : state.collection;
}
