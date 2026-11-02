// QA for SEO tags over the built site (dist) and the tutorial folder.
// Reports duplicate titles/descriptions, length limits, h1 count, lang, canonical, hreflang and JSON-LD validity.
// Usage: node scripts/check-seo.mjs   (exit code 1 on problems)
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const roots = [join(here, '..', 'dist'), join(here, '..', '..', 'tutorial')]

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    if (f === 'assets' || f === 'node_modules') continue
    const p = join(dir, f)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (f.endsWith('.html')) out.push(p)
  }
  return out
}

const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
const problems = []
const titles = new Map()
const descs = new Map()
const rows = []

for (const root of roots) {
  for (const file of walk(root)) {
    const rel = relative(join(here, '..', '..'), file)
    const html = readFileSync(file, 'utf8')
    const head = html.slice(0, html.indexOf('</head>'))
    const title = decode((head.match(/<title>([\s\S]*?)<\/title>/) ?? [])[1] ?? '')
    const desc = decode((head.match(/<meta name="description" content="([^"]*)"/) ?? [])[1] ?? '')
    const canon = (head.match(/<link rel="canonical" href="([^"]*)"/) ?? [])[1]
    const hreflangs = [...head.matchAll(/<link rel="alternate" hreflang="([^"]*)" href="([^"]*)"/g)].map((m) => m[1])
    const lang = (html.match(/<html lang="([^"]*)"/) ?? [])[1]
    const h1 = (html.match(/<h1[ >]/g) ?? []).length
    const body = html.slice(html.indexOf('<body'))
    const bodyNoNoscript = body.replace(/<noscript>[\s\S]*?<\/noscript>/g, '')
    const h1Visible = (bodyNoNoscript.match(/<h1[ >]/g) ?? []).length
    const isShell = rel.includes('frontend/dist')
    if (!title || title.length > 60) problems.push(`${rel}: title length ${title.length}`)
    if (desc.length < 120 || desc.length > 158) problems.push(`${rel}: description length ${desc.length}`)
    if (!canon || !canon.startsWith('https://')) problems.push(`${rel}: canonical missing`)
    for (const need of ['it', 'en', 'x-default']) if (!hreflangs.includes(need)) problems.push(`${rel}: hreflang ${need} missing`)
    if (!lang) problems.push(`${rel}: html lang missing`)
    if (!/name="viewport"/.test(head)) problems.push(`${rel}: viewport missing`)
    if (!isShell && h1 !== 1) problems.push(`${rel}: h1 count ${h1}`)
    if (isShell && h1 !== 1) problems.push(`${rel}: noscript h1 count ${h1}`)
    void h1Visible
    for (const m of head.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
      try { JSON.parse(m[1]) } catch (e) { problems.push(`${rel}: invalid JSON-LD (${e.message})`) }
    }
    if (!/application\/ld\+json/.test(head)) problems.push(`${rel}: JSON-LD missing`)
    if (/<img(?![^>]*\balt=)/.test(html)) problems.push(`${rel}: img without alt`)
    titles.set(title, [...(titles.get(title) ?? []), rel])
    descs.set(desc, [...(descs.get(desc) ?? []), rel])
    rows.push({ rel, lang, title, desc, canon })
  }
}
for (const [t, f] of titles) if (f.length > 1) problems.push(`duplicate title "${t}": ${f.join(', ')}`)
for (const [d, f] of descs) if (f.length > 1) problems.push(`duplicate description: ${f.join(', ')}`)

for (const r of rows) console.log(`${r.rel} [${r.lang}] ${r.canon}\n   ${r.title}\n   ${r.desc}`)
console.log(`\n${rows.length} pages checked, ${problems.length} problems`)
for (const p of problems) console.log('PROBLEM', p)
process.exit(problems.length ? 1 : 0)
