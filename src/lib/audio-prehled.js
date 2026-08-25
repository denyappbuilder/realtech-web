import { isoDuration } from './iso-duration.js';

const MAX_SECONDS = 60 * 60;
const AUDIO_PRIPONA = /\.(mp3|m4a|ogg|wav)$/i;

function secondsToIso(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return `PT${hours ? `${hours}H` : ''}${minutes}M${rest}S`;
}

function isoToSeconds(iso) {
  const match = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)$/);
  if (!match) return undefined;
  return Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
}

/** Kladné sekundy, ISO-8601 (`PT3M12S`) nebo MM:SS / HH:MM:SS. Jinak undefined. */
export function parseAudioDuration(value) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value <= 0 || value > MAX_SECONDS) return undefined;
    const seconds = Math.round(value);
    return { seconds, iso: secondsToIso(seconds) };
  }
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  const fromClock = isoDuration(trimmed);
  if (fromClock) {
    const seconds = isoToSeconds(fromClock);
    if (!seconds || seconds > MAX_SECONDS) return undefined;
    return { seconds, iso: fromClock };
  }
  const seconds = isoToSeconds(trimmed);
  if (!seconds || seconds > MAX_SECONDS) return undefined;
  return { seconds, iso: secondsToIso(seconds) };
}

export function formatAudioDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

export function jeAudioUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const url = new URL(value, 'https://realtech.cz');
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    return AUDIO_PRIPONA.test(url.pathname);
  } catch {
    return false;
  }
}

export function audioSrc(url, site) {
  if (!jeAudioUrl(url)) return undefined;
  try {
    return new URL(url, site ?? 'https://realtech.cz').href;
  } catch {
    return undefined;
  }
}

function encodingFromUrl(src) {
  const path = new URL(src).pathname.toLowerCase();
  if (path.endsWith('.m4a')) return 'audio/mp4';
  if (path.endsWith('.ogg')) return 'audio/ogg';
  if (path.endsWith('.wav')) return 'audio/wav';
  return 'audio/mpeg';
}

function neprázdnýText(value) {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

/**
 * Zdroj pro TTS pipeline: výslovnostní skript, nebo veřejný přepis u starších
 * článků. Veřejné výstupy tuto funkci záměrně nepoužívají.
 */
export function audioTtsScript(audio) {
  if (!audio || typeof audio !== 'object') return undefined;
  return neprázdnýText(audio.ttsScript) ?? neprázdnýText(audio.transcript);
}

/** Pohled pro přehrávač. Bez platného bloku `audio` vrací null. */
export function audioPrehledPohled(audio, site) {
  if (!audio || typeof audio !== 'object') return null;
  const duration = parseAudioDuration(audio.duration);
  const src = audioSrc(audio.url, site);
  if (!duration || !src) return null;
  // Do HTML i JSON-LD smí jít jen čitelný přepis, nikdy fonetický ttsScript.
  const prepis = neprázdnýText(audio.transcript);
  return {
    src,
    iso: duration.iso,
    seconds: duration.seconds,
    delkaText: formatAudioDuration(duration.seconds),
    prepis,
  };
}

/** AudioObject jen když existuje platný audio blok. Propojení na článek jde přes absolutní URL. */
export function vytvorAudioObject(audio, { site, articleUrl, title, description } = {}) {
  const pohled = audioPrehledPohled(audio, site);
  if (!pohled || !articleUrl) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'AudioObject',
    name: title ? `Audio přehled: ${title}` : 'Audio přehled',
    description,
    contentUrl: pohled.src,
    url: pohled.src,
    duration: pohled.iso,
    encodingFormat: encodingFromUrl(pohled.src),
    inLanguage: 'cs',
    '@id': `${articleUrl}#audio`,
    mainEntityOfPage: articleUrl,
    ...(pohled.prepis ? { transcript: pohled.prepis } : {}),
  };
}

/** NewsArticle dostane odkaz na AudioObject jen když audio existuje. */
export function pripojAudioKClanku(jsonLd, audioLd) {
  if (!audioLd) return jsonLd;
  return {
    ...jsonLd,
    audio: { '@id': audioLd['@id'] },
  };
}

/** JSON-LD text bez raw HTML — `<` v přepisu nesmí ukončit script tag. */
export function jsonLdText(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
