let collection = [];
let collectionCalls = [];

export function resetLlmsMocks() {
  collection = [];
  collectionCalls = [];
}

export function setCollection(entries) {
  collection = entries;
}

export function getCollectionCalls() {
  return collectionCalls;
}

export async function getCollection(name, filter) {
  collectionCalls.push({ name, filter });
  return collection.filter((entry) => filter(entry));
}

resetLlmsMocks();
