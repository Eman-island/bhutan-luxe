"use client";

import { useState, useTransition } from "react";
import { submitInquiry } from "../actions/inquiry";

export function InquiryForm() {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitInquiry(formData);
      if (result.ok) {
        setDone(true);
      } else {
        setError(result.error ?? "Something went wrong. Please try again.");
      }
    });
  }

  if (done) {
    return (
      <div className="form-thanks">
        <span className="label">Inquiry Received</span>
        <h3>Thank you.</h3>
        <p>
          We respond to every inquiry personally within 48 hours. Please watch
          your inbox.
        </p>
      </div>
    );
  }

  return (
    <form className="inquiry-form" action={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Full Name</label>
        <input type="text" id="name" name="name" autoComplete="name" required />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="phone">Phone Number</label>
        <input type="tel" id="phone" name="phone" autoComplete="tel" />
      </div>
      <div className="form-group">
        <label htmlFor="tier">Experience Tier</label>
        <select id="tier" name="tier" defaultValue="">
          <option value="" disabled>
            Select a tier
          </option>
          <option value="luxe">Luxe — $8,000 – $12,000</option>
          <option value="boutique-luxe">
            Boutique-Luxe — $12,000 – $25,000
          </option>
          <option value="ultra-luxe">Ultra-Luxe — $25,000 – $35,000+</option>
          <option value="bespoke">Bespoke — Let&apos;s discuss</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="window">Preferred Travel Window</label>
        <input
          type="text"
          id="window"
          name="window"
          placeholder="e.g. Spring 2026, flexible"
        />
      </div>
      <div className="form-group">
        <label htmlFor="group">Group Size</label>
        <input
          type="number"
          id="group"
          name="group"
          min={1}
          max={8}
          placeholder="1 – 8 guests"
        />
      </div>
      <div className="form-group full-width">
        <label htmlFor="notes">Anything else we should know</label>
        <textarea
          id="notes"
          name="notes"
          placeholder="Interests, requirements, questions — optional"
        />
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="form-submit">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Submitting…" : "Submit Inquiry"}
        </button>
      </div>
      <p className="form-note">
        Your information is held in strict confidence and is never shared. We do
        not send marketing communications without your consent.
      </p>
    </form>
  );
}
