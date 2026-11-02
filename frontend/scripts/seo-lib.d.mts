export interface SeoPage { id: string; path: string; [lang: string]: unknown }
export interface SeoMeta {
  lang: string; title: string; description: string; url: string; siteName: string
  locale: string; localeAlt: string; image: string; imageAlt: string
  alternates: { hreflang: string; href: string }[]
}
export function spaPath(lang: string, path: string): string
export function spaUrl(data: unknown, lang: string, path: string): string
export function tutorialUrl(data: unknown, lang: string, file: string): string
export function findSpaPage(data: unknown, path: string): SeoPage
export function spaAlternates(data: unknown, page: SeoPage): { hreflang: string; href: string }[]
export function tutorialAlternates(data: unknown, entry: unknown): { hreflang: string; href: string }[]
export function spaJsonLd(data: unknown, page: SeoPage, lang: string): Record<string, unknown>
export function spaMeta(data: unknown, page: SeoPage, lang: string): SeoMeta
