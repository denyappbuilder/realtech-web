// Řízená mutace produkce: shodí test-audio-prehled.mjs.
// Obnoví soubory i při pádu. Není součástí npm test.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = path.join(ROOT, 'src/pages/clanky/[...id].astro');
const KOMPONENTA = path.join(ROOT, 'src/components/AudioPrehled.astro');

const puvodniStranka = fs.readFileSync(PAGE, 'utf8');
const puvodniKomponenta = fs.readFileSync(KOMPONENTA, 'utf8');

const mutovanaStranka = puvodniStranka.replace(
  '{audioLd && <script type="application/ld+json" set:html={jsonLdText(audioLd)} slot="head" is:inline />}',
  '<script type="application/ld+json" set:html={jsonLdText(audioLd ?? { "@type": "AudioObject" })} slot="head" is:inline />',
);
const mutovanaKomponenta = puvodniKomponenta.replace(
  '<audio controls preload="metadata" src={pohled.src}>',
  '<audio controls autoplay preload="auto" src={pohled.src}>',
);

if (mutovanaStranka === puvodniStranka || mutovanaKomponenta === puvodniKomponenta) {
  console.error('Mutace nenašla cílový produkční kód — uprav kotvy v mutace-audio-prehled.mjs.');
  process.exit(2);
}

fs.writeFileSync(PAGE, mutovanaStranka);
fs.writeFileSync(KOMPONENTA, mutovanaKomponenta);

let kod = 1;
try {
  const vysledek = spawnSync(
    process.execPath,
    ['--test', '--test-reporter=tap', 'scripts/test-audio-prehled.mjs'],
    { cwd: ROOT, encoding: 'utf8' },
  );
  process.stdout.write(vysledek.stdout);
  process.stderr.write(vysledek.stderr);
  kod = vysledek.status === 0 ? 0 : vysledek.status ?? 1;
} finally {
  fs.writeFileSync(PAGE, puvodniStranka);
  fs.writeFileSync(KOMPONENTA, puvodniKomponenta);
}
process.exit(kod);
