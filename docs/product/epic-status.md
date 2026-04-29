# Epic Status — Bhutan Luxe

At-a-glance dashboard of the four epics in [`epics.md`](./epics.md). Project is **pre-build** — repo contains a brand style guide and empty HTML scaffolds, no Next.js, no live deployment.

| # | Epic | Status | % | Evidence |
|---|---|---|---|---|
| 1 | Brand-led marketing site | 🆕 | 0 | `website/index.html`, `about.html`, `readings.html` are empty scaffolds. No Next.js project. Brand tokens live only in the style-guide DOCX. |
| 2 | Lead capture & inquiry routing | 🆕 | 0 | No form endpoint chosen (Lark / Airtable / Resend TBD). No code. |
| 3 | Photography and storytelling content | 📋 | 10 | Brand style guide specifies photography direction. `content/`, `website/blog/`, `website/video/`, `website/images/` directories exist as empty containers. |
| 4 | Affiliate trust and discoverability | 🆕 | 0 | Partner narrative not drafted. No SEO scaffold. |

---

## Glyph legend

| Glyph | Meaning |
|---|---|
| ✅ | Shipped — fully wired, in production |
| 🔄 | In progress — partial wiring, gaps to close |
| 📋 | Planned — skeleton exists but not wired |
| 🆕 | Needs planning — not defined in code |

---

## Open questions before build can start

1. **Domain.** What is the production domain? Implies brand decisions (Bhutan-Luxe vs Rare Bhutan vs other).
2. **Form endpoint.** Lark / Airtable / Resend — pick one before Epic 2 can start.
3. **Affiliate disclosure on site.** Named, or implied? Affects copy on About and inquiry pages.
4. **Photography source.** Past trips, partner archive, commissioned new shoot, or mix? Implies Epic 3 timeline.
5. **Stack confirmation.** Next.js 16 to match other AIO sites, or 15? Tailwind v4 to match style guide?

---

## Audit basis

Code-level audit on 2026-04-29 across `website/`, `content/`, `context/`, and the brand style guide. The site has not been built; status is intentionally low.
