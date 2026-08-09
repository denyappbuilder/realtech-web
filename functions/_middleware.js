const REDIRECT_HOSTS = new Set(["www.realtech.cz", "realtech-web.pages.dev"]);

export function onRequest(context) {
  const url = new URL(context.request.url);
  const hostname = url.hostname.toLowerCase();

  // Přesměruj pouze přesně určené produkční aliasy, ne preview deploymenty.
  if (REDIRECT_HOSTS.has(hostname)) {
    return Response.redirect(
      `https://realtech.cz${url.pathname}${url.search}`,
      301,
    );
  }

  // Kanonická doména a všechny ostatní hosty pokračují beze změny.
  return context.next();
}
