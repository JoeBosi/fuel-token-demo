import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useI18n } from '../i18n'
import seoData from '../../scripts/seo-data.json'
import { findSpaPage, spaJsonLd, spaMeta } from '../../scripts/seo-lib.mjs'

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel: string, href: string, hreflang?: string) {
  const sel = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`
  let el = document.head.querySelector<HTMLLinkElement>(sel)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    if (hreflang) el.hreflang = hreflang
    document.head.appendChild(el)
  }
  el.href = href
}

/** Keeps title, description, canonical, hreflang, Open Graph, Twitter and JSON-LD in step with the route. */
export function Seo() {
  const { pathname } = useLocation()
  const { lang } = useI18n()
  useEffect(() => {
    const page = findSpaPage(seoData, pathname)
    const m = spaMeta(seoData, page, lang)
    document.documentElement.lang = lang
    document.title = m.title
    setMeta('name', 'description', m.description)
    setLink('canonical', m.url)
    for (const a of m.alternates) setLink('alternate', a.href, a.hreflang)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:site_name', m.siteName)
    setMeta('property', 'og:title', m.title)
    setMeta('property', 'og:description', m.description)
    setMeta('property', 'og:url', m.url)
    setMeta('property', 'og:image', m.image)
    setMeta('property', 'og:image:alt', m.imageAlt)
    setMeta('property', 'og:locale', m.locale)
    setMeta('property', 'og:locale:alternate', m.localeAlt)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', m.title)
    setMeta('name', 'twitter:description', m.description)
    setMeta('name', 'twitter:image', m.image)
    setMeta('name', 'twitter:image:alt', m.imageAlt)
    let ld = document.getElementById('seo-jsonld')
    if (!ld) {
      ld = document.createElement('script')
      ld.id = 'seo-jsonld'
      ld.setAttribute('type', 'application/ld+json')
      document.head.appendChild(ld)
    }
    ld.textContent = JSON.stringify(spaJsonLd(seoData, page, lang)).replace(/</g, '\\u003c')
  }, [pathname, lang])
  return null
}
