# Data Flows — Bhutan Luxe

**Status:** Pre-build. This document captures the planned shape of the only stateful surface — lead capture — so the first sprint can start cleanly.

---

## Inquiry pipeline (planned)

The site's only stateful path is the inquiry form. Everything else is static content.

```
Buyer submits form
    ↓
Vercel Function (or external endpoint)
    ↓
Validate payload (name, email, tier, party size, dates, source)
    ↓
Persist OR forward to chosen endpoint:
  - Lark webhook (founder notification)
  - Airtable (lightweight CRM)
  - Resend (founder email + buyer confirmation)
    ↓
Confirmation page → buyer + Resend confirmation email
```

The endpoint choice is **TBD**. Three reasonable options:

| Option | Pro | Con |
|---|---|---|
| Lark webhook | Fast founder notification; matches sister-brand pattern | No persistence; founder must re-enter into a CRM |
| Airtable | Becomes the CRM itself; advisor-friendly export | Adds a service; lock-in risk |
| Resend + simple DB | Full control; matches AIO multi-brand CRM if shared | Most engineering work to build |

Decide before Epic 2 starts.

---

## Static content flow

All non-form content (hero, tiers, itinerary teaser, photography, FAQ) is static and ships at build time.

```
MDX or content data files in `content/`
    ↓
Next.js SSG build
    ↓
CDN (Vercel)
```

Photography passes through `next/image` for optimisation. No runtime image transformation.

---

## What this site does NOT need

- A database (unless Airtable counts).
- An admin console.
- User accounts or authentication.
- Real-time features.
- A CMS beyond MDX-in-git.

---

## Cross-references

- Brand spec: [`../brand/design-rules.md`](../brand/design-rules.md) (forthcoming once style guide is distilled).
- Product context: [`../product/product.md`](../product/product.md).
