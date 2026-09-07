/**
 * Autorská identita REALTECH CZ — jeden zdroj pro zobrazení i schema.org.
 *
 * Živě se rozcházelo „Deny a Sam“ v author-boxu a „Daniel Soukup“ + „Sam“
 * v NewsArticle / Organization. Právní / schema jméno zůstává Daniel Soukup;
 * Deny je alternateName (veřejná přezdívka na kanálu).
 */

export const AUTOR_DENY = {
  name: 'Daniel Soukup',
  alternateName: 'Deny',
  jobTitle: 'Autor a spoluzakladatel',
};

export const AUTOR_SAM = {
  name: 'Sam',
  jobTitle: 'Autor a spoluzakladatel',
};

/** NewsArticle.author — Person + URL na /o-nas/. */
export function autoriClanku(site) {
  const url = site ? new URL('/o-nas/', site).href : undefined;
  return [
    {
      '@type': 'Person',
      name: AUTOR_DENY.name,
      alternateName: AUTOR_DENY.alternateName,
      ...(url ? { url } : {}),
    },
    {
      '@type': 'Person',
      name: AUTOR_SAM.name,
      ...(url ? { url } : {}),
    },
  ];
}

/** Organization.founder / employee na /o-nas/. */
export function zakladateleOrg() {
  return [
    {
      '@type': 'Person',
      name: AUTOR_DENY.name,
      alternateName: AUTOR_DENY.alternateName,
      jobTitle: AUTOR_DENY.jobTitle,
    },
    {
      '@type': 'Person',
      name: AUTOR_SAM.name,
      jobTitle: AUTOR_SAM.jobTitle,
    },
  ];
}
