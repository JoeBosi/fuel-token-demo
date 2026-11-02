// Writes public/sitemap.xml from seo-data.json (SPA pages and tutorial pages, IT and EN).
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { spaAlternates, spaUrl, tutorialAlternates, tutorialUrl } from './seo-lib.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const data = JSON.parse(readFileSync(join(here, 'seo-data.json'), 'utf8'))

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function entry(loc, alternates) {
  const links = alternates
    .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${esc(a.href)}"/>`)
    .join('\n')
  return `  <url>\n    <loc>${esc(loc)}</loc>\n    <lastmod>${data.lastmod}</lastmod>\n${links}\n  </url>`
}

const urls = []
for (const page of data.spa) {
  const alt = spaAlternates(data, page)
  for (const lang of ['it', 'en']) urls.push(entry(spaUrl(data, lang, page.path), alt))
}
for (const t of data.tutorial) {
  const alt = tutorialAlternates(data, t)
  for (const lang of ['it', 'en']) urls.push(entry(tutorialUrl(data, lang, t[lang].file), alt))
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`
writeFileSync(join(here, '..', 'public', 'sitemap.xml'), xml)
console.log(`sitemap.xml: ${urls.length} urls`)
