import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLE_DIR = path.join(ROOT, 'src/content/clanky');

const MIGRATED_ARTICLES = {
  'anthropic-risk-report-misalignment': ['Anthropic', 'Mythos 5', 'Mythos Preview', 'AI výzkum'],
  'chatgpt-pro-teenagery': ['ChatGPT', 'AI'],
  'chatgpt-reklamy-nove-trhy': ['ChatGPT', 'Free', 'Go', 'Business', 'Enterprise', 'Education'],
  'claude-vodoznak-ai-text': ['Anthropic', 'Clauda', 'Claude Platform', 'Claude Code', 'Claude Cowork', 'Claude Tag', 'AWS', 'Google Cloud', 'Microsoft Foundry', 'C2PA', 'Adobe', 'API', 'The Verge'],
  'gemini-plus-rok-zdarma-studenti': ['Google', 'Gemini', 'Google AI Pro', 'Gmail', 'Docs', 'Google Health Premium', 'Google AI Plus', 'YouTube Premium', 'SheerID', 'Gemini Live'],
  'glm-5-3-kybernalezy': ['Z.ai', 'GLM-5.3', 'GLM-5.2', 'Terminal-Bench 3.0', 'DeepSWE', 'Z.ai Code Bench', 'Claude Opus 4.8', 'Claude Fable 5', 'CyberGym', 'Mythos 5', 'GPT-5.6 Sol', 'ExploitBench', 'GLM Coding Plan', 'ZCode'],
  'meta-australie-zakaz-do-16-let': ['Facebooku', 'Instagramu', 'eSafety Commissioner', 'AI', 'App Store', 'Apple', 'Googlem'],
  'openai-pauza-rl-treninku-astra': ['Hugging Face', 'Critical', 'Preparedness Framework', 'frontier RL', 'PR'],
  'pixel-watch-detekce-dechu': ['Pixel Watch', 'Pixelu 11', 'Made by Google 2026', 'LTE', 'Pixel Watch 4', 'Pixel Watch 3', 'Pixel Watch 5'],
  'starship-ship-40-vanocni-ostrov': ['Starship', 'SpaceX', 'Ship 40', 'David Watchorn', 'Chris Bray', 'boosteru', 'OSN', 'Alice Gorman', 'Flinders University', 'ABC News', 'X'],
};

const PHONETIC_TOKENS = [
  'Entropik', 'Mýtos', 'prívjú', 'ej-aj', 'Čet dží-pí-tý', 'rólpleje',
  'Enterprajz', 'Edjukejšn', 'Byznys', 'Frí', 'Gó', 'Klaud', 'Gůgl',
  'Majkrosoft Faundri', 'ej-dabl-jú-es', 'Cé dva pé á', 'es-vé-gé',
  'pé-en-gé', 'jé-pé-gé', 'ej-pí-áj', 'Edoub', 'Džeminy', 'Džímejl',
  'Jútjub', 'Šír-áj-dý', 'Dží-el-em', 'Törminl', 'Díp es-dabl-jú-í',
  'Zet ej-aj', 'Oupus', 'Fejbl', 'Sajbr Džim', 'Dží-pí-tý', 'Eksploit Benč',
  'í-Sejfty Komišnr', 'Fejsbuk', 'Instagrem', 'Ep Stór', 'Haging Fejs',
  'Kritikl', 'Pripérdnes', 'frantýr ár-el', 'Piksl Voč', 'Mejd baj', 'Verž',
  'el-tý-í', 'Stáršip', 'Spejseks', 'Šip čtyřicet', 'Dejvid Vočorn',
  'Kris Brej', 'ó-es-en', 'Elis Gorman', 'Junyverzity', 'Ej-bí-sí njús',
];
const phoneticPattern = new RegExp(PHONETIC_TOKENS.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'iu');

function article(slug) {
  const source = fs.readFileSync(path.join(ARTICLE_DIR, `${slug}.md`), 'utf8');
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  assert.ok(match, `${slug}: chybí čitelný frontmatter`);
  return { data: load(match[1]), body: match[2] };
}

test('všech deset migrovaných článků odděluje čitelný transcript od TTS skriptu', () => {
  assert.equal(Object.keys(MIGRATED_ARTICLES).length, 10);

  for (const slug of Object.keys(MIGRATED_ARTICLES)) {
    const { data } = article(slug);
    assert.ok(data.audio?.transcript?.length > 500, `${slug}: chybí veřejný transcript`);
    assert.ok(data.audio?.ttsScript?.length > 500, `${slug}: chybí zdroj pro regeneraci TTS`);
    assert.doesNotMatch(data.audio.transcript, phoneticPattern, `${slug}: fonetický zápis unikl do veřejného transcriptu`);
    assert.match(data.audio.ttsScript, phoneticPattern, `${slug}: ttsScript už neuchovává výslovnostní zápis`);
    assert.match(data.audio.transcript, /Zdroj informací:/, `${slug}: veřejný transcript musí zachovat zdroj`);
  }
});

test('čitelné názvy v transcriptech odpovídají pravopisu v těle článku', () => {
  for (const [slug, names] of Object.entries(MIGRATED_ARTICLES)) {
    const { data, body } = article(slug);
    for (const name of names) {
      assert.ok(body.includes(name), `${slug}: tělo článku neobsahuje ověřovací název „${name}“`);
      assert.ok(data.audio.transcript.includes(name), `${slug}: transcript nepoužívá čitelný název „${name}“`);
    }
  }
});
