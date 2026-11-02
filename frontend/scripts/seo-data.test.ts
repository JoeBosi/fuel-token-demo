import { describe, expect, it } from 'vitest'
import data from './seo-data.json'
import { spaAlternates, spaJsonLd, spaMeta, tutorialAlternates, tutorialUrl, spaUrl } from './seo-lib.mjs'

type Page = { id: string; path: string; it: { title: string; description: string }; en: { title: string; description: string } }
const spa = data.spa as unknown as Page[]
const tutorial = data.tutorial as unknown as { id: string; it: { file: string; title: string; description: string }; en: { file: string; title: string; description: string } }[]
const all = [
  ...spa.flatMap((p) => [p.it, p.en]),
  ...tutorial.flatMap((p) => [p.it, p.en]),
]

describe('seo table', () => {
  it('has no duplicate titles or descriptions', () => {
    expect(new Set(all.map((x) => x.title)).size).toBe(all.length)
    expect(new Set(all.map((x) => x.description)).size).toBe(all.length)
  })
  it('respects length limits', () => {
    for (const x of all) {
      expect(x.title.length).toBeLessThanOrEqual(60)
      expect(x.description.length).toBeGreaterThanOrEqual(120)
      expect(x.description.length).toBeLessThanOrEqual(158)
    }
  })
  it('covers 4 SPA pages and 12 tutorial pages in both languages', () => {
    expect(spa).toHaveLength(4)
    expect(tutorial).toHaveLength(12)
  })
  it('gives reciprocal hreflang alternates for SPA pages', () => {
    for (const p of spa) {
      const it = spaAlternates(data, p).map((a) => a.hreflang + a.href)
      expect(it).toEqual([
        `it${spaUrl(data, 'it', p.path)}`, `en${spaUrl(data, 'en', p.path)}`, `x-default${spaUrl(data, 'it', p.path)}`,
      ])
      expect(spaMeta(data, p, 'en').alternates).toEqual(spaMeta(data, p, 'it').alternates)
    }
    expect(spaUrl(data, 'en', '/')).toBe(`${data.host}/en/`)
  })
  it('maps costruisci.html to build.html', () => {
    const b = tutorial.find((t) => t.id === 'build')!
    const alt = tutorialAlternates(data, b)
    expect(alt[0].href).toBe(tutorialUrl(data, 'it', 'costruisci.html'))
    expect(alt[1].href).toBe(tutorialUrl(data, 'en', 'build.html'))
  })
  it('produces JSON-LD with the author as Person', () => {
    const home = JSON.stringify(spaJsonLd(data, spa[0], 'en'))
    expect(home).toContain('SoftwareSourceCode')
    expect(home).toContain('"@type":"Person"')
    expect(JSON.stringify(spaJsonLd(data, spa[1], 'it'))).toContain('BreadcrumbList')
  })
})
