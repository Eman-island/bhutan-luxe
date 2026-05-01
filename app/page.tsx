"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { submitInquiry } from "./actions/inquiry";

type Tier = "luxe" | "boutique-luxe" | "ultra-luxe" | "bespoke" | "";

const TOTAL_STEPS = 3;

export default function Home() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refNumber, setRefNumber] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  function openModal(preselectTier?: Tier) {
    setStep(1);
    setDone(false);
    setError(null);
    setOpen(true);
    if (preselectTier && formRef.current) {
      requestAnimationFrame(() => {
        const radio = formRef.current?.querySelector<HTMLInputElement>(
          `input[name="tier"][value="${preselectTier}"]`,
        );
        if (radio) radio.checked = true;
      });
    }
  }

  function closeModal() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function nextOrSubmit() {
    setError(null);
    if (step === 1) {
      const form = formRef.current;
      if (!form) return;
      const name = (form.elements.namedItem("name") as HTMLInputElement)?.value.trim();
      const email = (form.elements.namedItem("email") as HTMLInputElement)?.value.trim();
      if (!name || !email) {
        setError("Name and email are required.");
        (form.elements.namedItem(name ? "email" : "name") as HTMLInputElement)?.focus();
        return;
      }
    }
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    startTransition(async () => {
      const result = await submitInquiry(fd);
      if (result.ok) {
        setRefNumber(result.refCode ?? "");
        setDone(true);
      } else {
        setError(result.error ?? "Something went wrong. Please try again.");
      }
    });
  }

  function back() {
    if (step > 1) setStep(step - 1);
  }

  return (
    <>
      {/* TOP BAR */}
      <div className="topbar">
        <a href="#" className="mark">
          <svg width="24" height="16" viewBox="0 0 28 18" fill="none" aria-hidden="true">
            <path d="M0 18 L9 4 L14 10 L19 2 L28 18 Z" fill="#C41E3A" />
            <path d="M0 18 L9 4 L11 7 L4 18 Z" fill="#FF8C00" />
          </svg>
          <span className="word">Bhutan-Luxe</span>
        </a>
        <div className="meta">
          <span>Spring · Autumn 2026</span>
          <span>Limited to 8 guests</span>
          <span>Texas · Thimphu</span>
        </div>
        <button className="open-form" onClick={() => openModal()}>
          Request Access ↗
        </button>
      </div>

      {/* HERO */}
      <section id="hero">
        <div className="frame">
          <div className="center">
            <span className="label eyebrow">An Invitation, Not a Tour</span>
            <h1>
              Three valleys
              <br />
              No roads
              <br />
              We arrive by <em>helicopter</em>
            </h1>
          </div>
          <div className="bottom">
            <p className="lede">
              Bhutan-Luxe is a private journey, eight guests at a time, through
              a country that has not been packaged. Every itinerary is arranged
              before you arrive.
            </p>
            <div className="stat">
              <span className="num">08</span>
              <span className="desc">Guests · per departure</span>
            </div>
            <div className="actions">
              <button className="btn-primary" onClick={() => openModal()}>
                Request Access
              </button>
              <a href="#tiers" className="btn-ghost">
                View the Tiers
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* DESIRE */}
      <section id="desire">
        <div className="img" />
        <div className="text">
          <span className="label">Why Bhutan. Why Now.</span>
          <h2>
            You have been
            <br />
            everywhere &nbsp;·&nbsp; Bhutan
            <br />
            is the <em>exception</em>
          </h2>
          <p>
            Most destinations have been discovered, packaged, and sold. Bhutan
            has not. Strict visitor limits and a culture that has never chased
            tourism mean the country remains, in most places, exactly as it was
            a century ago.
          </p>
          <p>
            Three valleys in the east have no roads, no lodges, no cell signal.
            We access them by helicopter. You can be among the first outsiders
            to set foot there.
          </p>
          <div className="stats">
            <div className="stat">
              <span className="num">3</span>
              <span className="desc">Roadless valleys</span>
            </div>
            <div className="stat">
              <span className="num">8</span>
              <span className="desc">Guests per group</span>
            </div>
            <div className="stat">
              <span className="num">10+</span>
              <span className="desc">Years of access</span>
            </div>
          </div>
        </div>
      </section>

      {/* TIERS */}
      <section id="tiers">
        <div className="header">
          <div className="num">03</div>
          <div>
            <span className="label">Experience Tiers</span>
            <h2>
              Choose your
              <br />
              level of <em>access</em>
            </h2>
          </div>
          <p className="intro">
            Three published tiers. Each can be lengthened, shortened, or wholly
            redesigned around your interests. No tier is shared with another
            party.
          </p>
        </div>

        <article className="tier-row">
          <div className="idx">I.</div>
          <div
            className="img-col"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=1200&q=80')",
            }}
          />
          <div className="body">
            <span className="tag">Tier One · Cultural Immersion</span>
            <h3>Luxe</h3>
            <div className="meta">
              <div>
                <span className="k">Investment</span>
                <span className="v">$8,000 – $12,000</span>
              </div>
              <div>
                <span className="k">Duration</span>
                <span className="v">7 days</span>
              </div>
              <div>
                <span className="k">Region</span>
                <span className="v">Paro · Thimphu</span>
              </div>
            </div>
            <p>
              Cultural immersion across the Paro and Thimphu valleys. Monastery
              visits, private lodge stays, and a quiet introduction to Bhutan
              as it presents itself to its few invited guests.
            </p>
            <div className="actions">
              <button className="btn-primary" onClick={() => openModal("luxe")}>
                Request Details
              </button>
              <a href="#" className="btn-line">
                Sample Itinerary →
              </a>
            </div>
          </div>
        </article>

        <article className="tier-row">
          <div className="idx">II.</div>
          <div
            className="img-col"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80')",
            }}
          />
          <div className="body">
            <span className="tag">Tier Two · Remote Valleys</span>
            <h3>Boutique-Luxe</h3>
            <div className="meta">
              <div>
                <span className="k">Investment</span>
                <span className="v">$12,000 – $25,000</span>
              </div>
              <div>
                <span className="k">Duration</span>
                <span className="v">10 days</span>
              </div>
              <div>
                <span className="k">Region</span>
                <span className="v">Bumthang · Gangtey</span>
              </div>
            </div>
            <p>
              Gateway access to the country&apos;s remote eastern valleys.
              Private ceremonies, wild glamping in locations unavailable
              through any other operator, and a journey between two worlds.
            </p>
            <div className="actions">
              <button
                className="btn-primary"
                onClick={() => openModal("boutique-luxe")}
              >
                Request Details
              </button>
              <a href="#" className="btn-line">
                Sample Itinerary →
              </a>
            </div>
          </div>
        </article>

        <article className="tier-row">
          <div className="idx">III.</div>
          <div
            className="img-col"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80')",
            }}
          />
          <div className="body">
            <span className="tag">Tier Three · Helicopter &amp; Audience</span>
            <h3>Ultra-Luxe</h3>
            <div className="meta">
              <div>
                <span className="k">Investment</span>
                <span className="v">$25,000 – $35,000+</span>
              </div>
              <div>
                <span className="k">Duration</span>
                <span className="v">10 days</span>
              </div>
              <div>
                <span className="k">Region</span>
                <span className="v">Lhuentse · Trashiyangtse</span>
              </div>
            </div>
            <p>
              Helicopter access to trailless regions of eastern Bhutan. Private
              audiences arranged through relationships built over a decade.
              Designed for those for whom access itself is the luxury.
            </p>
            <div className="actions">
              <button
                className="btn-primary"
                onClick={() => openModal("ultra-luxe")}
              >
                Request Details
              </button>
              <a href="#" className="btn-line">
                Sample Itinerary →
              </a>
            </div>
          </div>
        </article>
      </section>

      {/* REGIONS */}
      <section id="regions">
        <div className="wrap">
          <div className="header">
            <div>
              <span className="label">Regions Accessed</span>
              <h2>
                Where the
                <br />
                <em>helicopters</em> go
              </h2>
            </div>
            <p className="intro">
              Five access points across Bhutan. Three of them require permits
              and clearances that take weeks to arrange. We begin that work the
              moment your inquiry is received.
            </p>
          </div>

          <div className="map">
            <svg viewBox="0 0 1200 525" preserveAspectRatio="none">
              <path
                d="M120 220 C 200 160, 320 140, 440 170 C 540 195, 640 175, 760 185 C 880 195, 1000 220, 1080 280 C 1100 320, 1060 360, 980 380 C 860 410, 720 400, 600 390 C 480 380, 360 395, 240 380 C 160 370, 100 320, 120 220 Z"
                fill="rgba(247,245,240,0.04)"
                stroke="rgba(212,168,67,0.4)"
                strokeWidth={1}
              />
              <path
                d="M180 260 Q 320 280, 460 290 T 760 310 T 1020 320"
                fill="none"
                stroke="rgba(212,168,67,0.2)"
                strokeWidth={1}
                strokeDasharray="2 6"
              />
              <path
                d="M260 200 Q 380 240, 500 260"
                fill="none"
                stroke="rgba(212,168,67,0.2)"
                strokeWidth={1}
                strokeDasharray="2 6"
              />
              <path
                d="M540 280 Q 700 200, 880 250"
                fill="none"
                stroke="rgba(255,140,0,0.5)"
                strokeWidth={1.5}
                strokeDasharray="4 8"
              />
              <path
                d="M540 280 Q 720 360, 920 320"
                fill="none"
                stroke="rgba(255,140,0,0.5)"
                strokeWidth={1.5}
                strokeDasharray="4 8"
              />
            </svg>

            <div className="pin" style={{ top: "56%", left: "24%" }}>
              <div className="dot" />
              <div className="lbl">Paro · Arrival</div>
            </div>
            <div className="pin" style={{ top: "50%", left: "33%" }}>
              <div className="dot" />
              <div className="lbl">Thimphu</div>
            </div>
            <div className="pin" style={{ top: "56%", left: "46%" }}>
              <div className="dot" />
              <div className="lbl">Bumthang</div>
            </div>
            <div className="pin" style={{ top: "42%", left: "70%" }}>
              <div
                className="dot"
                style={{
                  background: "var(--crimson)",
                  boxShadow: "0 0 0 4px rgba(196,30,58,0.18)",
                }}
              />
              <div className="ring" />
              <div className="lbl" style={{ borderColor: "var(--crimson)" }}>
                Lhuentse · Heli
              </div>
            </div>
            <div className="pin" style={{ top: "62%", left: "78%" }}>
              <div
                className="dot"
                style={{
                  background: "var(--crimson)",
                  boxShadow: "0 0 0 4px rgba(196,30,58,0.18)",
                }}
              />
              <div className="ring" />
              <div className="lbl" style={{ borderColor: "var(--crimson)" }}>
                Trashiyangtse · Heli
              </div>
            </div>
          </div>

          <div className="legend">
            <div className="item">
              <span className="k">— Saffron route</span>
              <div className="v">Helicopter access</div>
              <p>
                Two routes into the eastern roadless valleys. Available in Tier
                Three only, weather permitting.
              </p>
            </div>
            <div className="item">
              <span className="k">● Saffron pin</span>
              <div className="v">Standard access</div>
              <p>
                Reachable by road and arranged transport. Included in every
                tier from Luxe upward.
              </p>
            </div>
            <div className="item">
              <span className="k">● Crimson pin</span>
              <div className="v">Restricted access</div>
              <p>
                Permits arranged in advance. Trailless terrain, no lodges, and
                no signal beyond the landing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section id="trust">
        <div className="wrap">
          <div className="header">
            <div>
              <span className="label">Why Bhutan-Luxe</span>
              <h2>
                Access earned over
                <br />
                <em>years</em> &nbsp;·&nbsp; Not purchased
              </h2>
            </div>
            <p className="intro">
              Our partner on the ground in Bhutan holds relationships that took
              more than a decade to establish — with local authorities,
              monastery administrators, and helicopter operators. Those
              relationships are what make our access possible.
            </p>
          </div>

          <div className="quotes">
            <div className="quote">
              <span className="qm">&ldquo;</span>
              <blockquote>
                I have traveled to over sixty countries. Nothing prepared me
                for what we saw in the eastern valleys. I don&apos;t know that
                I&apos;ll travel anywhere else the same way again.
              </blockquote>
              <cite>— Dallas, TX &nbsp;·&nbsp; Ultra-Luxe guest, 2025</cite>
            </div>
            <div className="quote">
              <span className="qm">&ldquo;</span>
              <blockquote>
                The discretion was absolute. Every detail was arranged before
                we arrived. We simply showed up and experienced it.
              </blockquote>
              <cite>
                — Houston, TX &nbsp;·&nbsp; Boutique-Luxe guest, 2025
              </cite>
            </div>
          </div>

          <div className="partner-row">
            <div className="img" />
            <div>
              <span className="label">On-the-ground Partner</span>
              <h3>A decade of relationships, not a vendor list</h3>
              <p>
                Our affiliate partner — MyBhutan, in Thimphu — has spent more
                than ten years building access to monasteries, valleys, and
                helicopter routes that are not for sale. Their relationships
                are what we extend to you.
              </p>
              <a
                href="https://www.mybhutan.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                mybhutan.com →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* INQUIRY MODAL */}
      <div
        className={`modal-backdrop${open ? " on" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="modal">
          <aside className="side">
            <div>
              <span className="label">Concierge Inquiry</span>
              <h3>A short, private conversation</h3>
              <p>
                We respond within 48 hours by phone or by email — whichever you
                prefer.
              </p>
              <div className="steps">
                {[1, 2, 3].map((n) => {
                  const cls =
                    done || step > n ? "done" : step === n ? "active" : "";
                  const labels = [
                    "About you",
                    "Tier & window",
                    "Anything else",
                  ];
                  return (
                    <div key={n} className={`row ${cls}`} data-i={n}>
                      <span className="n">{String(n).padStart(2, "0")}</span>
                      <span className="l">{labels[n - 1]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(247,245,240,0.4)",
              }}
            >
              Held in strict confidence
            </div>
          </aside>

          <div className="form-pane">
            <div className="head">
              <span className="label">
                {done ? "Confirmation" : `Step ${step} of ${TOTAL_STEPS}`}
              </span>
              <button
                className="close"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
              {!done && (
                <>
                  <div
                    className={`modal-step${step === 1 ? " on" : ""}`}
                    data-step={1}
                  >
                    <h2>
                      Let&apos;s begin with <em>you</em>
                    </h2>
                    <div className="form-group">
                      <label htmlFor="m_name">Full Name</label>
                      <input
                        type="text"
                        id="m_name"
                        name="name"
                        autoComplete="name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="m_email">Email Address</label>
                      <input
                        type="email"
                        id="m_email"
                        name="email"
                        autoComplete="email"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="m_phone">Phone Number</label>
                      <input
                        type="tel"
                        id="m_phone"
                        name="phone"
                        autoComplete="tel"
                        placeholder="Optional, for a personal reply"
                      />
                    </div>
                  </div>

                  <div
                    className={`modal-step${step === 2 ? " on" : ""}`}
                    data-step={2}
                  >
                    <h2>
                      Choose your <em>tier</em>
                    </h2>
                    <div className="tier-pick">
                      <label>
                        <input type="radio" name="tier" value="luxe" />
                        <span className="tp-name">Luxe</span>
                        <span className="tp-price">
                          $8K – $12K · 7 days
                        </span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="tier"
                          value="boutique-luxe"
                        />
                        <span className="tp-name">Boutique-Luxe</span>
                        <span className="tp-price">
                          $12K – $25K · 10 days
                        </span>
                      </label>
                      <label>
                        <input type="radio" name="tier" value="ultra-luxe" />
                        <span className="tp-name">Ultra-Luxe</span>
                        <span className="tp-price">
                          $25K – $35K+ · 10 days
                        </span>
                      </label>
                      <label>
                        <input type="radio" name="tier" value="bespoke" />
                        <span className="tp-name">Bespoke</span>
                        <span className="tp-price">Let&apos;s discuss</span>
                      </label>
                    </div>
                    <div className="form-group" style={{ marginTop: 16 }}>
                      <label htmlFor="m_window">
                        Preferred Travel Window
                      </label>
                      <input
                        type="text"
                        id="m_window"
                        name="window"
                        placeholder="e.g. Spring 2026, flexible"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="m_group">Group Size</label>
                      <input
                        type="number"
                        id="m_group"
                        name="group"
                        min={1}
                        max={8}
                        placeholder="1 – 8 guests"
                      />
                    </div>
                  </div>

                  <div
                    className={`modal-step${step === 3 ? " on" : ""}`}
                    data-step={3}
                  >
                    <h2>
                      Anything else we<br />
                      should <em>know</em>
                    </h2>
                    <div className="form-group">
                      <label htmlFor="m_notes">
                        Interests, requirements, questions
                      </label>
                      <textarea
                        id="m_notes"
                        name="notes"
                        placeholder="Optional — spiritual, outdoor, photographic, dietary, anything at all"
                      />
                    </div>
                    <p
                      style={{
                        fontSize: 12,
                        color: "rgba(59,58,54,0.5)",
                        lineHeight: 1.6,
                      }}
                    >
                      Your information is held in strict confidence and is
                      never shared. We do not send marketing communications
                      without your consent.
                    </p>
                    {error ? (
                      <p
                        style={{
                          color: "var(--crimson)",
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        {error}
                      </p>
                    ) : null}
                  </div>

                  <div className="controls">
                    <button
                      type="button"
                      className="back"
                      onClick={back}
                      style={{ visibility: step === 1 ? "hidden" : "visible" }}
                    >
                      ← Back
                    </button>
                    <span className="progress">
                      {String(step).padStart(2, "0")} / 0{TOTAL_STEPS}
                    </span>
                    <button
                      type="button"
                      className="next"
                      onClick={nextOrSubmit}
                      disabled={pending}
                    >
                      {pending
                        ? "Submitting…"
                        : step === TOTAL_STEPS
                          ? "Submit Inquiry"
                          : "Continue →"}
                    </button>
                  </div>
                </>
              )}

              {done && (
                <div className="modal-success on">
                  <span className="label">Inquiry Received</span>
                  <h2>
                    Thank you &nbsp;·&nbsp; We&apos;ll be in touch within 48
                    hours
                  </h2>
                  <p>
                    A confirmation has been sent to your email. The founder
                    will respond personally — by phone, if you&apos;ve shared a
                    number, otherwise by email.
                  </p>
                  <div className="ref">Reference · {refNumber}</div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="row">
            <div className="brand">
              <span className="word">Bhutan-Luxe</span>
              <span className="tag">The Bhutan Few Will Ever See</span>
            </div>
            <div className="col">
              <h5>Contact</h5>
              <a href="mailto:concierge@bhutan-luxe.com">
                concierge@bhutan-luxe.com
              </a>
              <a
                href="https://wa.me/84937302252"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
              <a href="tel:+1">+1 (Texas)</a>
            </div>
            <div className="col">
              <h5>Tiers</h5>
              <a href="#tiers">Luxe</a>
              <a href="#tiers">Boutique-Luxe</a>
              <a href="#tiers">Ultra-Luxe</a>
              <a href="#tiers">Bespoke</a>
            </div>
            <div className="col">
              <h5>Discretion</h5>
              <p>
                All inquiries are handled with complete discretion. No data is
                shared with third parties. We do not maintain a mailing list.
              </p>
            </div>
          </div>
          <div className="footnote">
            <span>© 2026 Bhutan Luxury Travel · Texas</span>
            <span>In partnership with MyBhutan, Thimphu</span>
          </div>
        </div>
      </footer>
    </>
  );
}
