const initialState = () => ({
  collection: [],
  existingFiles: new Map(),
  collectionCalls: [],
  existsCalls: [],
  statCalls: [],
  rssCalls: [],
  rssResult: undefined,
});

let state = initialState();

export function resetRssMocks() {
  state = initialState();
  state.rssResult = { source: "rss-test-double" };
}

export function setCollection(collection) {
  state.collection = collection;
}

export function setExistingFiles(files) {
  state.existingFiles = new Map(files);
}

export function getMockState() {
  return state;
}

export async function getCollection(name, filter) {
  state.collectionCalls.push({ name, filter });
  return state.collection.filter((entry) => filter(entry));
}

export function rss(options) {
  state.rssCalls.push(options);
  return state.rssResult;
}

export const mockFs = {
  existsSync(path) {
    state.existsCalls.push(path);
    return state.existingFiles.has(path);
  },
  statSync(path) {
    state.statCalls.push(path);
    return { size: state.existingFiles.get(path) };
  },
};

resetRssMocks();
