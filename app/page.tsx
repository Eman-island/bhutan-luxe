import { InquiryForm } from "./_components/inquiry-form";

export default function Home() {
  return (
    <>
      {/* ── 1. HERO ── */}
      <section id="hero">
        <div className="hero-content">
          <span className="label eyebrow">Bhutan-Luxe</span>
          <h1>
            The Bhutan Few
            <br />
            Will Ever See.
          </h1>
          <a href="#inquiry" className="btn-primary">
            Request Access
          </a>
        </div>
      </section>

      {/* ── 2. THE DESIRE ── */}
      <section id="desire">
        <div className="inner">
          <div className="desire-image" />
          <div className="desire-text">
            <span className="label">Why Bhutan. Why Now.</span>
            <h2>
              You have been
              <br />
              everywhere.
              <br />
              Bhutan is
              <br />
              the exception.
            </h2>
            <p>
              Most destinations have been discovered, packaged, and sold. Bhutan
              has not. Strict visitor limits, no public land transport into the
              interior, and a culture that has never chased tourism mean the
              country remains, in most places, exactly as it was.
            </p>
            <p>
              Three valleys in eastern Bhutan have no roads, no lodges, no cell
              signal. We access them by helicopter. You can be among the first
              outsiders to set foot there.
            </p>
            <div className="stat-row">
              <div className="stat">
                <span className="number">8</span>
                <span className="desc">Guests per departure</span>
              </div>
              <div className="stat">
                <span className="number">3</span>
                <span className="desc">Tiers of access</span>
              </div>
              <div className="stat">
                <span className="number">1</span>
                <span className="desc">Partner on the ground</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. EXPERIENCE TIERS ── */}
      <section id="tiers">
        <div className="container">
          <div className="section-header">
            <span className="label">Experience Tiers</span>
            <h2>
              Choose your
              <br />
              level of access.
            </h2>
          </div>
          <div className="tier-grid">
            <div className="tier-card">
              <div
                className="card-image"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800&q=80')",
                }}
              />
              <div className="card-body">
                <span className="tier-label">Tier One</span>
                <h3>Luxe</h3>
                <p className="price">
                  $8,000 – $12,000 &nbsp;·&nbsp; 7 days
                </p>
                <p>
                  Cultural immersion, monastery visits, and luxury lodge stays.
                  An accessible entry point into Bhutan&apos;s most celebrated
                  landmarks, with white-glove execution throughout.
                </p>
                <a href="#inquiry" className="btn-secondary">
                  Request Details
                </a>
              </div>
            </div>

            <div className="tier-card">
              <div
                className="card-image"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80')",
                }}
              />
              <div className="card-body">
                <span className="tier-label">Tier Two</span>
                <h3>Boutique-Luxe</h3>
                <p className="price">
                  $12,000 – $25,000 &nbsp;·&nbsp; 10 days
                </p>
                <p>
                  Gateway access to remote valleys, private ceremonies, and
                  wild glamping in locations unavailable through any other
                  operator. A journey between two worlds.
                </p>
                <a href="#inquiry" className="btn-secondary">
                  Request Details
                </a>
              </div>
            </div>

            <div className="tier-card">
              <div
                className="card-image"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80')",
                }}
              />
              <div className="card-body">
                <span className="tier-label">Tier Three</span>
                <h3>Ultra-Luxe</h3>
                <p className="price">
                  $25,000 – $35,000+ &nbsp;·&nbsp; 10 days
                </p>
                <p>
                  Fully customized. Helicopter access to trailless regions.
                  Private audiences unavailable through any other channel.
                  Designed for those for whom access itself is the luxury.
                </p>
                <a href="#inquiry" className="btn-secondary">
                  Request Details
                </a>
              </div>
            </div>
          </div>
          <p className="bespoke-note">
            We also collaborate directly with you and our affiliate partner in
            Bhutan to design a fully bespoke itinerary — spiritual, outdoor,
            cultural, or otherwise. Mention this in your inquiry.
          </p>
        </div>
      </section>

      {/* ── 4. TRUST ── */}
      <section id="trust">
        <div className="container">
          <div className="section-header">
            <span className="label">Why Bhutan-Luxe</span>
            <h2>
              Access earned over years.
              <br />
              Not purchased.
            </h2>
          </div>
          <div className="trust-grid">
            <div className="trust-block">
              <div className="quote-mark">&ldquo;</div>
              <blockquote>
                I have traveled to over sixty countries. Nothing prepared me
                for what we saw in the eastern valleys. I don&apos;t know that
                I&apos;ll travel anywhere else the same way again.
              </blockquote>
              <cite>— Dallas, TX &nbsp;·&nbsp; Ultra-Luxe guest, 2025</cite>
            </div>
            <div className="trust-block">
              <div className="quote-mark">&ldquo;</div>
              <blockquote>
                The discretion was absolute. Every detail was arranged before
                we arrived. We simply showed up and experienced it.
              </blockquote>
              <cite>
                — Houston, TX &nbsp;·&nbsp; Boutique-Luxe guest, 2025
              </cite>
            </div>
          </div>
          <div className="trust-partner">
            <p>
              Our affiliate partner on the ground in Bhutan holds relationships
              that took more than a decade to establish — with local
              authorities, monastery administrators, and helicopter operators.
              Those relationships are what make our access possible.
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
      </section>

      {/* ── 5. INQUIRY FORM ── */}
      <section id="inquiry">
        <div className="container">
          <div className="section-header">
            <span className="label">Begin Your Inquiry</span>
            <h2>
              This is a concierge
              <br />
              inquiry, not a booking.
            </h2>
            <p>
              We respond within 48 hours. Every inquiry is handled personally.
            </p>
          </div>
          <InquiryForm />
        </div>
      </section>

      {/* ── 6. FOOTER ── */}
      <footer>
        <div className="container">
          <div className="footer-brand">
            <h3>Bhutan-Luxe</h3>
            <p>The Bhutan Few Will Ever See</p>
          </div>
          <div className="footer-contact">
            <a href="mailto:Rare.Bhutan@bhutan-luxe.com">
              Rare.Bhutan@bhutan-luxe.com
            </a>
            <a
              href="https://wa.me/84937302252"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
            <p className="privacy-note">
              All inquiries are handled with complete discretion. No data is
              shared with third parties.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
