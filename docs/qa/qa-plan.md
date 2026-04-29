# QA Plan — Bhutan Luxe

Tiered test plan for the planned build. The site is small and content-led — most quality risk lives in brand discipline, photography, and form delivery, not in code complexity.

---

## Tier 1 — Smoke (every deploy)

- Homepage returns 200; brand fonts load; hero image renders without layout shift.
- Each section renders on mobile, tablet, desktop without overflow.
- Inquiry form is reachable from any page in two clicks.

---

## Tier 2 — Inquiry pipeline (pre-release)

- **Submit valid inquiry.** Name, email, tier, party size, dates → 200 → buyer sees confirmation page → Resend confirmation email arrives within 60 seconds → founder is notified within 5 minutes.
- **Validation.** Empty/invalid email rejected with field-level error and no submit. Future-impossible dates rejected.
- **Persistence.** Submission appears in the chosen endpoint (Lark message / Airtable row / DB row).

---

## Tier 3 — Brand discipline (pre-release)

The site is brand-critical. Drift kills the offer.

- Typography matches the style guide (no fallback fonts shipping in production).
- Colour tokens match the style guide.
- Photography meets the editorial bar (no stock photos, no partner-supplied low-res images).
- Voice and tone match the brand voice (no marketing-speak, no superlatives that read as cheap).

A brand reviewer (Dave or designated) signs off before each release.

---

## Tier 4 — Photography and performance

- Hero image LCP under 1.5s on 4G.
- All gallery images served via `next/image` with appropriate sizing.
- No image weighs more than 250 KB after optimisation.
- Lighthouse score 95+ on Performance, Accessibility, SEO, Best Practices.

---

## Tier 5 — Trust signals

- Affiliate-partner section renders; partner is identifiable (per copy decision in product.md).
- Press / awards strip (if any) renders with valid links.
- Structured data validates in Google's rich-results test.
- Contact paths (form + any direct email) are reachable.

---

## Quality gates

| Gate | When | Failure mode |
|---|---|---|
| Tier 1 smoke | Every deploy | Block merge to main |
| Tier 2 inquiry | Pre-release | Block release |
| Tier 3 brand | Pre-release | Brand reviewer sign-off required |
| Tier 4 perf | Pre-release | Block release if Lighthouse < 95 |
| Tier 5 trust | Quarterly | Document gaps and fix before next quarter |

---

## Sequencing

Tier 1 runs automatically on PR. Tiers 2–4 run pre-release. Tier 5 runs quarterly. The brand-discipline gate (Tier 3) is the highest-risk failure mode for this site — protect it.
