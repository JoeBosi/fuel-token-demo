#!/usr/bin/env python3
"""Idempotent SEO pass over fuel/tutorial/{it,en}/*.html.

Reads frontend/scripts/seo-data.json and, for every tutorial page, (re)writes between markers:
title, meta description, canonical, hreflang, Open Graph, Twitter cards, JSON-LD (Course / TechArticle),
and the cross-link footer (author site, GitHub, LinkedIn). In English pages the links to the app
(/, /app, /faucet, /come-funziona) point to the /en/ versions. Safe to run repeatedly.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "frontend/scripts/seo-data.json").read_text(encoding="utf-8"))
HOST, REPO = DATA["host"], DATA["repo"]
S, E = "<!-- seo:start -->", "<!-- seo:end -->"
FS, FE = "<!-- footer:start -->", "<!-- footer:end -->"


def url(lang, f):
    return f"{HOST}/tutorial/{lang}/" + ("" if f == "index.html" else f)


def person():
    a = DATA["author"]
    return {"@type": "Person", "name": a["name"], "url": a["url"], "sameAs": a["sameAs"]}


def jsonld(entry, lang):
    e = entry[lang]
    u = url(lang, e["file"])
    idx = next(t for t in DATA["tutorial"] if t["id"] == "index")
    course_id = url(lang, "index.html") + "#course"
    if entry["id"] == "index":
        node = {"@context": "https://schema.org", "@type": "Course", "@id": course_id, "name": DATA["site"][lang]["courseName"],
                "description": e["description"], "url": u, "inLanguage": lang, "provider": person(), "author": person()}
    else:
        node = {"@context": "https://schema.org", "@type": "TechArticle", "headline": e["headline"], "description": e["description"],
                "url": u, "inLanguage": lang, "author": person(), "datePublished": DATA["lastmod"], "dateModified": DATA["lastmod"],
                "isPartOf": {"@type": "Course", "@id": course_id, "name": DATA["site"][lang]["courseName"], "url": url(lang, idx[lang]["file"])}}
    return json.dumps(node, ensure_ascii=False).replace("<", "\\u003c")


def head_block(entry, lang):
    e, site = entry[lang], DATA["site"][lang]
    other = "en" if lang == "it" else "it"
    u = url(lang, e["file"])
    img = HOST + DATA["ogImage"]
    q = lambda s: html.escape(s, quote=True)
    m = lambda k, v, a="name": f'<meta {a}="{k}" content="{q(v)}">'
    lines = [
        S,
        f"<title>{html.escape(e['title'], quote=False)}</title>",
        m("description", e["description"]),
        f'<link rel="canonical" href="{u}">',
        f'<link rel="alternate" hreflang="it" href="{url("it", entry["it"]["file"])}">',
        f'<link rel="alternate" hreflang="en" href="{url("en", entry["en"]["file"])}">',
        f'<link rel="alternate" hreflang="x-default" href="{url("it", entry["it"]["file"])}">',
        m("og:type", "article" if entry["id"] != "index" else "website", "property"),
        m("og:site_name", site["name"], "property"), m("og:title", e["title"], "property"),
        m("og:description", e["description"], "property"), m("og:url", u, "property"),
        m("og:image", img, "property"), m("og:image:type", "image/jpeg", "property"),
        m("og:image:width", "1200", "property"), m("og:image:height", "630", "property"),
        m("og:image:alt", site["imageAlt"], "property"), m("og:locale", site["locale"], "property"),
        m("og:locale:alternate", DATA["site"][other]["locale"], "property"),
        m("twitter:card", "summary_large_image"), m("twitter:title", e["title"]), m("twitter:description", e["description"]),
        m("twitter:image", img), m("twitter:image:alt", site["imageAlt"]),
        f'<script type="application/ld+json">{jsonld(entry, lang)}</script>',
        E,
    ]
    return "\n".join(lines)


def footer_block(lang):
    s = DATA["site"][lang]
    firma = "Prof. Giuseppe Bosi, Scienze e Tecnologie Informatiche" if lang == "it" else "Prof. Giuseppe Bosi, Computer Science and Technology"
    ext = 'target="_blank" rel="noopener"'
    return (f'{FS}<footer><a href="https://www.giuseppebosi.com">{firma}</a>'
            f'<p class="xlinks"><a href="{DATA["author"]["url"]}" {ext}>{s["footerSite"]}</a> · '
            f'<a href="{REPO}" {ext}>{s["footerCode"]}</a> · '
            f'<a href="https://www.linkedin.com/in/giuseppebosi" {ext}>{s["footerLinkedin"]}</a></p></footer>{FE}')


def process(entry, lang):
    path = ROOT / "tutorial" / lang / entry[lang]["file"]
    t = path.read_text(encoding="utf-8")
    t = re.sub(re.escape(S) + r".*?" + re.escape(E) + r"\n?", "", t, flags=re.S)
    t = re.sub(r"<title>.*?</title>\n?", "", t, flags=re.S)
    t = t.replace("</head>", head_block(entry, lang) + "\n</head>", 1)
    t = re.sub(re.escape(FS) + r".*?" + re.escape(FE), "", t, flags=re.S)
    t = re.sub(r"<footer>.*?</footer>", lambda _: footer_block(lang), t, count=1, flags=re.S)
    if lang == "en":
        t = re.sub(r'href="(/|/app|/faucet|/come-funziona)"', lambda mo: 'href="/en' + ("/" if mo.group(1) == "/" else mo.group(1)) + '"', t)
    path.write_text(t, encoding="utf-8")


for entry in DATA["tutorial"]:
    for lang in ("it", "en"):
        process(entry, lang)
print("tutorial pages processed:", len(DATA["tutorial"]) * 2)
