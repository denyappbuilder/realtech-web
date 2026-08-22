import { readFileSync } from 'node:fs';

const snapshotUrl = new URL('../../src/data/videos.json', import.meta.url);

export default JSON.parse(readFileSync(snapshotUrl, 'utf8'));
