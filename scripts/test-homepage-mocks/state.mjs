const initialState = () => ({
  collection: [],
  collectionCalls: [],
  existingFiles: new Set(),
});

let state = initialState();

export function resetHomepageMocks() {
  state = initialState();
}

export function setCollection(collection) {
  state.collection = collection;
}

export function setExistingFiles(paths) {
  state.existingFiles = new Set(paths);
}

export function getHomepageMockState() {
  return state;
}

export async function getCollection(name, filter) {
  state.collectionCalls.push({ name, filter });
  return state.collection.filter((entry) => filter(entry));
}

export const mockFs = {
  existsSync(path) {
    return state.existingFiles.has(path);
  },
};
