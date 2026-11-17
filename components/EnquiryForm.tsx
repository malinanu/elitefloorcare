"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitEnquiry } from "@/app/actions/enquiry";
import { facilityTypes } from "@/lib/facility-types";
import type { EnquiryState } from "@/lib/enquiry-state";
import { CheckCircle } from "./icons";
import Turnstile from "./Turnstile";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function EnquiryForm() {
  const [state, action, pending] = useActionState<EnquiryState, FormData>(submitEnquiry, { status: "idle" });
  const [dismissed, setDismissed] = useState<EnquiryState | null>(null);
  const [round, setRound] = useState(0); // remounts inputs so defaultValue re-applies after an error
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "error") {
      setRound((r) => r + 1);
      errorRef.current?.focus();
    }
    if (state.status === "success") successRef.current?.focus();
  }, [state]);

  const showSuccess = state.status === "success" && dismissed !== state;
  const err = state.status === "error" ? state : null;
  const v = err?.values ?? {};
  const fe = err?.fieldErrors ?? {};

  const field = (name: keyof typeof fe) => ({
    name,
    id: `f-${name}`,
    defaultValue: v[name] ?? undefined,
    "aria-invalid": fe[name] ? true : undefined,
    "aria-describedby": fe[name] ? `e-${name}` : undefined,
    className: "efc-field",
  });
  const fieldErr = (name: keyof typeof fe) =>
    fe[name] ? (
      <span className="field-error" id={`e-${name}`}>
        {fe[name]}
      </span>
    ) : null;

  return (
    <div className="form-card rv">
      {showSuccess ? (
        <div className="success" ref={successRef} tabIndex={-1} role="status">
          <CheckCircle size={44} color="#143781" />
          <h3>Request received</h3>
          <p>Thanks — we&apos;ll be in touch within one business day to arrange a time that suits your facility&apos;s schedule.</p>
          <button type="button" className="efc-outline-dark" onClick={() => setDismissed(state)}>
            Send another request
          </button>
        </div>
      ) : (
        <form action={action} className="form">
          <h3>Request a free inspection</h3>
          {err && (
            <div className="form-error" role="alert" tabIndex={-1} ref={errorRef}>
              {err.message}
            </div>
          )}
          <div key={round} style={{ display: "contents" }}>
          <div className="fields">
            <label htmlFor="f-name">
              <span>Name</span>
              <input required autoComplete="name" maxLength={120} {...field("name")} />
              {fieldErr("name")}
            </label>
            <label htmlFor="f-business">
              <span>Business / facility</span>
              <input required autoComplete="organization" maxLength={160} {...field("business")} />
              {fieldErr("business")}
            </label>
            <label htmlFor="f-phone">
              <span>Phone</span>
              <input required type="tel" autoComplete="tel" maxLength={40} {...field("phone")} />
              {fieldErr("phone")}
            </label>
            <label htmlFor="f-email">
              <span>Email</span>
              <input required type="email" autoComplete="email" maxLength={200} {...field("email")} />
              {fieldErr("email")}
            </label>
          </div>
          <label htmlFor="f-location">
            <span>Location</span>
            <input required placeholder="Suburb, Victoria" maxLength={160} {...field("location")} />
            {fieldErr("location")}
          </label>
          <label htmlFor="f-facilityType">
            <span>Facility type</span>
            <select {...field("facilityType")} defaultValue={v.facilityType || facilityTypes[0]}>
              {facilityTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            {fieldErr("facilityType")}
          </label>
          <label htmlFor="f-message">
            <span>Message</span>
            <textarea rows={4} placeholder="Number of courts, current condition, preferred timing" maxLength={4000} {...field("message")} />
            {fieldErr("message")}
          </label>
          </div>
          {/* honeypot: hidden from people and assistive tech */}
          <div className="hp" aria-hidden="true">
            <label>
              Company website
              <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          {SITE_KEY && <Turnstile siteKey={SITE_KEY} resetSignal={round} />}
          <button type="submit" className="efc-cta" disabled={pending}>
            {pending ? "Sending…" : "Request a Free Inspection"}
          </button>
          <small>We reply within one business day. Your details are never shared.</small>
        </form>
      )}
    </div>
  );
}
