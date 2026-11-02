export type UrlLang = 'it' | 'en'

const EN_PREFIX = '/en'

/** English lives under /en, Italian at the root. */
export function langFromPath(pathname: string): UrlLang {
  return pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`) ? 'en' : 'it'
}

/** Router basename for a page: "/en" on English URLs, "/" otherwise. */
export function basenameFromPath(pathname: string): string {
  return langFromPath(pathname) === 'en' ? EN_PREFIX : '/'
}

/** Path without the language prefix ("/en/app" -> "/app", "/en" -> "/"). */
export function stripLangPrefix(pathname: string): string {
  if (langFromPath(pathname) !== 'en') return pathname
  return pathname.slice(EN_PREFIX.length) || '/'
}

/** Equivalent URL (path + query + hash) in the other language. */
export function switchLangUrl(pathname: string, search: string, hash: string, to: UrlLang): string {
  const bare = stripLangPrefix(pathname)
  const path = to === 'en' ? (bare === '/' ? `${EN_PREFIX}/` : `${EN_PREFIX}${bare}`) : bare
  return `${path}${search}${hash}`
}
