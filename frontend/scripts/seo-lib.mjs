// Pure SEO helpers shared by the build (prerender, sitemap) and the app (Seo component).
// Everything takes the parsed seo-data.json as a parameter, so this file has no I/O.

/** Path of an SPA page for a language: IT at the root, EN under /en. */
export function spaPath(lang, path) {
  if (lang === 'en') return path === '/' ? '/en/' : `/en${path}`
  return path
}

export function spaUrl(data, lang, path) {
  return data.host + spaPath(lang, path)
}

export function tutorialUrl(data, lang, file) {
  return `${data.host}/tutorial/${lang}/${file === 'index.html' ? '' : file}`
}

/** Finds the SPA page matching a path without the language prefix; unknown paths fall back to home. */
export function findSpaPage(data, path) {
  const clean = path.length > 1 ? path.replace(/\/+$/, '') : path
  return data.spa.find((p) => p.path === clean) ?? data.spa[0]
}

/** hreflang alternates (it, en, x-default = IT) for an SPA page. */
export function spaAlternates(data, page) {
  return [
    { hreflang: 'it', href: spaUrl(data, 'it', page.path) },
    { hreflang: 'en', href: spaUrl(data, 'en', page.path) },
    { hreflang: 'x-default', href: spaUrl(data, 'it', page.path) },
  ]
}

export function tutorialAlternates(data, entry) {
  return [
    { hreflang: 'it', href: tutorialUrl(data, 'it', entry.it.file) },
    { hreflang: 'en', href: tutorialUrl(data, 'en', entry.en.file) },
    { hreflang: 'x-default', href: tutorialUrl(data, 'it', entry.it.file) },
  ]
}

function person(data) {
  return { '@type': 'Person', name: data.author.name, url: data.author.url, sameAs: data.author.sameAs }
}

function website(data, lang) {
  const s = data.site[lang]
  return {
    '@type': 'WebSite',
    '@id': `${spaUrl(data, lang, '/')}#website`,
    name: s.name,
    url: spaUrl(data, lang, '/'),
    inLanguage: lang,
    description: s.description,
    publisher: person(data),
    author: person(data),
  }
}

/** JSON-LD object for an SPA page (home: WebSite + SoftwareSourceCode; others: WebPage + breadcrumb). */
export function spaJsonLd(data, page, lang) {
  const url = spaUrl(data, lang, page.path)
  const site = website(data, lang)
  if (page.id === 'home') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        site,
        {
          '@type': 'SoftwareSourceCode',
          name: data.site[lang].name,
          description: data.site[lang].description,
          url,
          inLanguage: lang,
          codeRepository: data.repo,
          programmingLanguage: ['Solidity', 'TypeScript', 'JavaScript'],
          runtimePlatform: 'Polygon Amoy (testnet)',
          license: 'https://opensource.org/licenses/MIT',
          author: person(data),
        },
      ],
    }
  }
  const home = data.spa[0]
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: page[lang].title,
        description: page[lang].description,
        inLanguage: lang,
        isPartOf: { '@id': site['@id'] },
        author: person(data),
      },
      site,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: home[lang].breadcrumb, item: spaUrl(data, lang, '/') },
          { '@type': 'ListItem', position: 2, name: page[lang].breadcrumb, item: url },
        ],
      },
    ],
  }
}

/** Head metadata (everything except JSON-LD) for an SPA page. */
export function spaMeta(data, page, lang) {
  const s = data.site[lang]
  const other = lang === 'it' ? 'en' : 'it'
  return {
    lang,
    title: page[lang].title,
    description: page[lang].description,
    url: spaUrl(data, lang, page.path),
    siteName: s.name,
    locale: s.locale,
    localeAlt: data.site[other].locale,
    image: data.host + data.ogImage,
    imageAlt: s.imageAlt,
    alternates: spaAlternates(data, page),
  }
}
