const REDIRECT_HOSTS = new Set(["www.realtech.cz", "realtech-web.pages.dev"]);

export function onRequest(context) {
  const url = new URL(context.request.url);
  // Absolutní FQDN („www.realtech.cz.") je tentýž host — bez ořezu tečky
  // by alias proklouzl mimo REDIRECT_HOSTS a nekanonizoval se.
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");

  // Přesměruj pouze přesně určené produkční aliasy, ne preview deploymenty.
  if (REDIRECT_HOSTS.has(hostname)) {
    return Response.redirect(
      `https://realtech.cz${url.pathname}${url.search}`,
      301,
    );
  }

  // Kolo 60: slugy článků a témat jsou vždy malými písmeny. /Clanky/,
  // /clanky/Claude-Sonnet-5-5-Kdy-Prejit/ nebo /temata/AI-Report/ vracely
  // živě 29. 9. 2026 404 (ručně přepsaná / sdílená adresa). Jen tyto dvě
  // sekce, jen ASCII A–Z v cestě; query string beze změny. Kódované znaky
  // (%C4…) zůstávají — toLowerCase by z nich udělal jinou (neplatnou) URL.
  if (/^\/(?:clanky|temata)(?:\/|$)/i.test(url.pathname) && /[A-Z]/.test(url.pathname.replace(/%[0-9A-F]{2}/g, ''))) {
    const cesta = url.pathname.replace(/%[0-9A-F]{2}|[A-Z]+/g, (s) => (s.startsWith('%') ? s : s.toLowerCase()));
    return Response.redirect(`${url.origin}${cesta}${url.search}`, 301);
  }

  // Kanonická doména a všechny ostatní hosty pokračují beze změny.
  return context.next();
}
