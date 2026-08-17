let existingFiles = new Set();

export function setFiles(paths) {
  existingFiles = new Set(paths);
}

export function reset() {
  existingFiles = new Set();
}

export const mockFs = {
  existsSync(path) {
    return existingFiles.has(path);
  },
};
