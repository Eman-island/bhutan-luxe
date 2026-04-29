# Epics — Bhutan Luxe

Four thematic epics for the planned build. Status is tracked in [`epic-status.md`](./epic-status.md). All epics are pre-build as of 2026-04-29 — the repo contains scaffold HTML and a brand style guide, no live code.

---

## Epic 1 — Brand-led marketing site

**Thesis:** A single-page (or short-funnel) marketing site that conveys rarity, intentionality, and trust within the first scroll, designed to brand spec down to the typography and photography.

**Bundle:** Hero, brand story, the three tiers (Boutique-Luxe / Luxe / Ultra-Luxe), itinerary teaser, social proof, founder/affiliate-partner story, FAQ, footer with inquiry CTA.

**Mechanism:** Next.js (planned) deployed on Vercel. Content authored in MDX or a small CMS. Photography optimised via `next/image`. Brand tokens live in `globals.css` and match the style guide.

**Success criterion:** Site reads as a bespoke luxury operator, not a tourism portal. Time-on-page above 90 seconds for the target audience. Bounce on the inquiry CTA below 30%.

---

## Epic 2 — Lead capture & inquiry routing

**Thesis:** Every qualified inquiry reaches the operator within minutes, with enough context to triage (party size, tier interest, dates).

**Bundle:** Inquiry form (multi-step preferred), routing to the chosen endpoint (Lark / Airtable / Resend), confirmation email to the buyer, founder notification.

**Mechanism:** Form posts to a server endpoint (Vercel Function or external API). Successful submit → confirmation email via Resend, founder notification via Lark or email. Form schema captures name, email, tier interest, party size, target travel dates, source.

**Success criterion:** Median time from submit to founder seeing the inquiry is under 5 minutes. Zero dropped submissions. Founder can triage in one screen.

---

## Epic 3 — Photography and storytelling content

**Thesis:** The site is only as luxe as its photography. The content layer must be production-grade — original imagery, editorial-quality prose, no stock.

**Bundle:** Hero film/photo, gallery of trip imagery, founder story, on-the-ground partner profile, sample itinerary excerpts, testimonials.

**Mechanism:** Imagery sourced from past trips and partner archives. Copy commissioned to brand-voice spec. Content authored in MDX so updates are git-versioned.

**Success criterion:** A buyer can scroll the site and feel the place. Five+ qualified inquiries cite specific images or stories in their first reply.

---

## Epic 4 — Affiliate trust and discoverability

**Thesis:** Concierge services, private banks, and lifestyle advisors should feel safe referring this site. Search-discovery is secondary; trust is primary.

**Bundle:** About / "who we are" page, partner disclosure, press / awards strip (if any), structured-data SEO, deliverable PDF for advisors.

**Mechanism:** Partner story rendered with photography. Light SEO with structured data (Person, Organization, Service). Optional one-page PDF advisors can attach to client emails.

**Success criterion:** At least three named affiliate channels feel comfortable referring within the first quarter post-launch.
