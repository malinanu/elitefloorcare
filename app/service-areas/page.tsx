import type { Metadata } from "next";
import { CtaBand, PlainHero, TickList } from "@/components/inner";

export const metadata: Metadata = {
  title: "Where We Work",
  description: "Elite Sports Floor Care services timber sports floors across all of Victoria — metro, regional and rural — with no travel surcharge.",
  alternates: { canonical: "/service-areas" },
};

const times = [
  { k: "Enquiry", v: "1 business day", p: "Someone who's actually been on a court rings you back — not a call centre." },
  { k: "Inspection booked", v: "Within 2 weeks", p: "Sooner in metro, and we'll always try to fit around your booking sheet." },
  { k: "Written report", v: "3 business days", p: "Photos, findings, costed recommendation and a five-year forward plan." },
  { k: "Plan clients", v: "48 hours", p: "Gold plan holders get an on-site response to urgent floor damage within two days." },
];

export default function ServiceAreasPage() {
  return (
    <main className="pg">
      <PlainHero
        title="Where We Work"
        lead="All of Victoria. One workshop in Dandenong South, crews that travel, and no surcharge for being outside the metro ring."
        crumbs={[{ href: "/", label: "Home" }, { label: "Where We Work" }]}
      />

      <section className="ps ps-mist">
        <div className="pg-wrap pg-split pg-split--center">
          <div className="pg-panel pg-diagram rv">
            <div className="pg-rings" role="img" aria-label="Coverage diagram: Dandenong South workshop at the centre, crews covering all of Victoria">
              <span className="r1" />
              <span className="r2" />
              <span className="r3" />
              <span className="hx" />
              <span className="vx" />
              <span className="dot" />
              <span className="lbl lbl-home">Dandenong South</span>
              <span className="lbl lbl-vic">Victoria-wide</span>
            </div>
            <p>Coverage diagram · not to scale</p>
          </div>
          <div>
            <span className="pg-eyebrow rv">Coverage</span>
            <h2 className="pg-h2 rv">If it&apos;s in Victoria, we&apos;ll come to it</h2>
            <p className="pg-p rv" style={{ marginBottom: 26 }}>
              Metro, regional or rural — same crews, same products, same price per court. Regional work is scheduled in blocks so the travel isn&apos;t on your invoice, which is why
              booking a few weeks ahead usually gets you a better slot than an emergency call.
            </p>
            <div className="rv">
              <TickList
                large
                color="#143781"
                items={[
                  "Every Victorian council area covered",
                  "No travel loading on regional quotes",
                  "Multi-site portfolios scheduled as one program",
                  "Southern NSW and Riverina by arrangement",
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="ps ps-white">
        <div className="pg-wrap">
          <span className="pg-eyebrow rv">What to expect</span>
          <h2 className="pg-h2 pg-h2--sm rv">Response times</h2>
          <div className="pg-tiles">
            {times.map((t) => (
              <div className="pg-tile rv" key={t.k}>
                <small>{t.k}</small>
                <b>{t.v}</b>
                <p>{t.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Not sure if we cover your area? Ask us."
        text="Tell us where the floor is and we'll tell you straight away — including if you'd be better off with someone closer."
      />
    </main>
  );
}
