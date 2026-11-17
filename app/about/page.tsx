import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Arrow, Calendar, Clock, Court, Cross, Pin, Tick } from "@/components/icons";

export const metadata: Metadata = {
  title: "About",
  description: "Victorian timber sports floor specialists — our story, why facility managers choose us, and our accreditations.",
  alternates: { canonical: "/about" },
};

const saw = [
  "Courts coated in domestic finishes that went slippery under sweat.",
  "Lines painted on top instead of sealed under.",
  "Schools told they needed a full sand when the floor needed one screen and two coats.",
];

const cards = [
  { icon: <Court size={26} color="#438AD4" sw={1.8} />, t: "Timber sports floors only", p: "No decks, no houses, no vinyl. Every product we carry and every technique we use is chosen for one surface, which is why we can tell a recoat from a re-sand at a glance." },
  { icon: <Clock size={26} color="#438AD4" sw={1.8} />, t: "We work when you don't", p: "Nights, weekends, term breaks, shutdown weeks. Most single-court jobs hand back ready to play the next morning, so nothing comes off your booking sheet." },
  { icon: <Calendar size={26} color="#438AD4" sw={1.8} />, t: "Priced for a budget cycle", p: "Fixed-term plans with the schedule and the scope locked, so the floor is a predictable line item rather than an emergency capital request." },
  { icon: <Pin size={26} color="#438AD4" sw={1.8} />, t: "Victorian, and local about it", p: "One workshop in Dandenong South, crews that travel the state, and the same people on the quote and the invoice." },
];

const accr = [
  { k: "Insurance", t: "$20m public liability", p: "Certificate of currency on request" },
  { k: "Compliance", t: "Working with Children", p: "Every crew member, checked and current" },
  { k: "Safety", t: "SWMS & site inductions", p: "Job-specific, issued before we start" },
  { k: "Product", t: "Manufacturer accredited", p: "Applicator warranty on sports finishes" },
];

const crew = [
  { src: "/assets/photos/crew_member_taping_court_line.jpg", alt: "Crew masking court lines", cap: "Masking court lines" },
  { src: "/assets/photos/worker_applying_coating_on_court.jpg", alt: "Coating being rolled at night", cap: "Coating rolled at night" },
  { src: "/assets/photos/floor_screening_machine_operatin.jpg", alt: "Screening machine and dust extraction", cap: "Screening and dust extraction" },
  { src: "/assets/photos/empty_sports_court_at_sunrise.jpg", alt: "Finished court handed back at sunrise", cap: "Handed back at sunrise" },
];

export default function AboutPage() {
  return (
    <main className="ab">
      {/* HERO */}
      <section className="ab-hero">
        <div className="ab-hero-bg">
          <Image src="/assets/photos/empty_sports_court_at_sunrise.jpg" alt="Finished timber sports court at sunrise" fill priority sizes="100vw" />
        </div>
        <div className="wrap">
          <nav className="ab-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <b aria-current="page">About</b>
          </nav>
          <h1>
            Very good at <em>one thing</em>
          </h1>
          <p>A floor-sanding crew who stopped doing everything, and got very good at one thing: timber sports floors.</p>
          <Link href="/#contact" className="efc-cta ab-btn">
            Request a Free Inspection
            <Arrow size={16} color="#061A3D" />
          </Link>
          <div className="ab-stats">
            {[
              ["1998", "Sports-floor-only since"],
              ["1,400+", "Courts coated"],
              ["11", "People on the tools"],
              ["$20m", "Public liability cover"],
            ].map(([b, s]) => (
              <div className="ab-stat" key={s}>
                <b>{b}</b>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="ab-sec ab-mist">
        <div className="wrap ab-story">
          <div className="ab-photo rv">
            <Image
              src="/assets/photos/owner_and_crew_holding_applicator.jpg"
              alt="Two of the crew on site with a coating applicator"
              width={1200}
              height={896}
              sizes="(max-width: 1000px) 460px, 480px"
            />
            <div className="ab-badge">
              <i>
                <Pin size={20} color="#B9791C" />
              </i>
              <div>
                <b>Dandenong South</b>
                <span>One workshop, crews across Victoria</span>
              </div>
            </div>
          </div>
          <div>
            <span className="ab-eyebrow rv">Our story</span>
            <h2 className="ab-h2 rv">From every kind of floor to Victoria&apos;s courts</h2>
            <p className="ab-lead rv">
              Elite Sports Floor Care started out sanding every kind of floor — houses, shops, church halls, whatever came up. By the late nineties we&apos;d noticed something: the
              sports floors were the jobs everyone else was getting wrong.
            </p>
            <span className="ab-saw-label rv">What we kept seeing</span>
            <div className="ab-saw">
              {saw.map((s) => (
                <div className="rv" key={s}>
                  <i>
                    <Cross size={14} color="#B9791C" />
                  </i>
                  {s}
                </div>
              ))}
            </div>
            <p className="ab-text rv">
              So in 1998 we stopped taking domestic work altogether and Elite Sports Floor Care became a sports-floor-only business. Nearly three decades on, it&apos;s still Victorian,
              still hands-on, and still the same answer to the same question.
            </p>
            <div className="ab-quote rv">
              <i />
              <div>
                <b>What does this floor actually need?</b>
                <span>
                  The owner still quotes every job personally. That&apos;s deliberate — the person who tells you what your floor needs is the person accountable for the crew that does
                  it.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY DIFFERENT */}
      <section className="ab-sec ab-white">
        <div className="wrap ab-why">
          <div className="ab-why-head">
            <span className="ab-eyebrow rv">Why we&apos;re different</span>
            <h2 className="ab-h2 rv">Four things facility managers tell us matter</h2>
          </div>
          <div className="ab-cards">
            {cards.map((c) => (
              <div className="ab-card rv" key={c.t}>
                <span className="ic">{c.icon}</span>
                <h3>{c.t}</h3>
                <p>{c.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACCREDITATIONS */}
      <section className="ab-sec ab-navy ab-dark">
        <div className="wrap">
          <div className="ab-accr-head">
            <div>
              <span className="ab-eyebrow rv">Accreditations &amp; standards</span>
              <h2 className="ab-h2 rv">Paperwork your procurement team will ask for</h2>
            </div>
            <p className="rv">Current certificates are supplied with every quote — and we&apos;re happy to be added to your contractor management system before we set foot on site.</p>
          </div>
          <div className="ab-accr">
            {accr.map((a) => (
              <div className="rv" key={a.k}>
                <i>
                  <Tick size={18} color="#E8A33D" />
                </i>
                <small>{a.k}</small>
                <b>{a.t}</b>
                <span>{a.p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CREW */}
      <section className="ab-sec ab-mist">
        <div className="wrap">
          <span className="ab-eyebrow rv">On the tools</span>
          <h2 className="ab-h2 rv">The crew, mid-job</h2>
          <div className="ab-crew">
            {crew.map((c) => (
              <figure className="rv" key={c.cap}>
                <Image src={c.src} alt={c.alt} fill sizes="(max-width: 1000px) 50vw, 300px" />
                <figcaption>{c.cap}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ab-sec ab-navy ab-dark ab-cta-sec">
        <div className="wrap">
          <div className="ab-cta rv">
            <div>
              <h2>Ready to protect your floor?</h2>
              <p>Free inspection, written report, costed recommendation. The owner does the quote personally.</p>
            </div>
            <Link href="/#contact" className="efc-cta ab-btn">
              Request a Free Inspection
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
