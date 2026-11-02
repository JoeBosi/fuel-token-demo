// Runs after `vite build`: writes one HTML file per indexable route and language, with the
// page-specific <head> (title, description, canonical, hreflang, og:*, twitter:*, JSON-LD)
// and a <noscript> summary, so crawlers that do not run JavaScript still read the content.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { spaJsonLd, spaMeta, spaPath } from './seo-lib.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const dist = join(here, '..', 'dist')
const data = JSON.parse(readFileSync(join(here, 'seo-data.json'), 'utf8'))
const template = readFileSync(join(dist, 'index.html'), 'utf8')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function headBlock(m, jsonLd) {
  const tag = (name, content, attr = 'name') => `    <meta ${attr}="${name}" content="${esc(content)}" />`
  return [
    `    <title>${escText(m.title)}</title>`,
    tag('description', m.description),
    `    <link rel="canonical" href="${esc(m.url)}" />`,
    ...m.alternates.map((a) => `    <link rel="alternate" hreflang="${a.hreflang}" href="${esc(a.href)}" />`),
    tag('og:type', 'website', 'property'),
    tag('og:site_name', m.siteName, 'property'),
    tag('og:title', m.title, 'property'),
    tag('og:description', m.description, 'property'),
    tag('og:url', m.url, 'property'),
    tag('og:image', m.image, 'property'),
    tag('og:image:type', 'image/jpeg', 'property'),
    tag('og:image:width', '1200', 'property'),
    tag('og:image:height', '630', 'property'),
    tag('og:image:alt', m.imageAlt, 'property'),
    tag('og:locale', m.locale, 'property'),
    tag('og:locale:alternate', m.localeAlt, 'property'),
    tag('twitter:card', 'summary_large_image'),
    tag('twitter:title', m.title),
    tag('twitter:description', m.description),
    tag('twitter:image', m.image),
    tag('twitter:image:alt', m.imageAlt),
    `    <script type="application/ld+json" id="seo-jsonld">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
  ].join('\n')
}

function noscriptBlock(page, lang) {
  const nav = data.nav[lang]
    .map(([p, label]) => `<li><a href="${esc(spaPath(lang, p))}">${escText(label)}</a></li>`)
    .join('')
  const tut = lang === 'it'
    ? { href: '/tutorial/it/', label: 'Tutorial' }
    : { href: '/tutorial/en/', label: 'Tutorial' }
  return `    <noscript><h1>${escText(page[lang].h1)}</h1><p>${escText(page[lang].summary)}</p><ul>${nav}<li><a href="${tut.href}">${tut.label}</a></li><li><a href="${esc(data.repo)}">GitHub</a></li></ul></noscript>`
}

function render(page, lang) {
  const m = spaMeta(data, page, lang)
  let html = template
  html = html.replace(/<html lang="[^"]*"/, `<html lang="${lang}"`)
  // drop the generic tags of the template; the generated block replaces them
  html = html.replace(/\s*<title>[\s\S]*?<\/title>/g, '')
  html = html.replace(/\s*<meta (?:name|property)="(?:description|og:[^"]*|twitter:[^"]*)"[^>]*>/g, '')
  html = html.replace(/\s*<link rel="(?:canonical|alternate)"[^>]*>/g, '')
  html = html.replace('</head>', `${headBlock(m, spaJsonLd(data, page, lang))}\n  </head>`)
  html = html.replace(/\s*<noscript>[\s\S]*?<\/noscript>/g, '')
  html = html.replace('<div id="root"></div>', `${noscriptBlock(page, lang)}\n    <div id="root"></div>`)
  return html
}

let n = 0
for (const page of data.spa) {
  for (const lang of ['it', 'en']) {
    const rel = spaPath(lang, page.path).replace(/^\//, '').replace(/\/$/, '')
    const dir = join(dist, rel)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), render(page, lang))
    n++
  }
}
console.log(`prerender: ${n} pages`)
