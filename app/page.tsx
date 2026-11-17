import Image from "next/image";
import Link from "next/link";
import EnquiryForm from "@/components/EnquiryForm";
import { Arrow, Clock, Pin, Tick } from "@/components/icons";
import { sectors, site } from "@/content/site";

const benefits = [
  { t: "Extend floor life", p: "Recoating renews the wear layer so the timber underneath is never sacrificed.", icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v10M7 12h10" /></> },
  { t: "Maintain appearance", p: "Even gloss, crisp line marking and a surface your facility is proud to show.", icon: <path d="M12 3l2.2 5.6L20 9.3l-4.4 3.9L17 19l-5-3-5 3 1.4-5.8L4 9.3l5.8-.7z" /> },
  { t: "Reduce costly sanding", p: "Stay on a recoat cycle and you defer full sand-and-refinish for years.", icon: <><path d="M4 7l6 6 4-4 6 6" /><path d="M20 10v5h-5" /></> },
  { t: "Minimise downtime", p: "Scheduled around holidays and off-peak hours. Most floors are ready the next day.", icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></> },
  { t: "Keep courts game-ready", p: "Correct slip resistance and ball response, season after season.", icon: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M12 5v14" /><circle cx="12" cy="12" r="2.5" /></> },
];

const serviceCards = [
  { slug: "preventative-maintenance", t: "Preventative Maintenance", p: "A programmed annual cycle that keeps the coating ahead of the wear.", icon: <><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></> },
  { slug: "recoating", t: "Sports Floor Recoating", p: "Screen, clean and re-coat in sports-grade finish. Ready to play the next day.", icon: <><rect x="4" y="4" width="14" height="6" rx="2" /><path d="M18 7h2v5h-8v3" /><rect x="10.5" y="15" width="3" height="6" rx="1" /></> },
  { slug: "deep-cleaning", t: "Deep Cleaning", p: "Lifts embedded grime and rubber marking that mopping leaves behind.", icon: <><path d="M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6z" /><path d="M18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9z" /></> },
  { slug: "court-line-marking", t: "Court Line Marking", p: "Set out to code for basketball, netball, badminton, volleyball and futsal.", icon: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M12 5v14" /><circle cx="12" cy="12" r="2.5" /></> },
  { slug: "floor-inspections", t: "Floor Inspections", p: "A written condition report with photos and a costed recommendation. Free.", icon: <><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></> },
];

const plans = [
  {
    name: "Bronze", dot: "#96ACC6", desc: "A one-year agreement — an easy first step onto a proper cycle.", price: "$4,200", term: "1-year",
    items: ["Annual condition inspection", "One deep clean per year", "Written report with photos", "Priority booking window"],
  },
  {
    name: "Silver", dot: "#438AD4", desc: "Three years — what most busy school and club courts settle on.", price: "$13,800", term: "3-year",
    items: ["Everything in Bronze", "One full recoat within term", "Line marking touch-ups", "Fixed pricing for the term", "School-holiday scheduling"],
  },
  {
    name: "Gold", dot: "#E8A33D", desc: "Five years — the whole job looked after, and the best value per year.", price: "$25,500", term: "5-year", gold: true,
    items: ["Everything in Silver", "Two full recoats within term", "Full line-marking reset once", "Emergency call-out response", "Annual asset-condition summary for your board"],
  },
];

const pairs = [
  {
    before: { src: "/images/Indoor_basketball_court_interior_20260910165522.jpg", alt: "Before: worn, dull school hall court" },
    after: { src: "/images/Basketball_court_in_sports_facility_20260910165522.jpg", alt: "After: same court, freshly recoated and gloss" },
    cap: "Regional high school — full recoat and line-marking reset, back in use next morning.",
  },
  {
    before: { src: "/images/Elevated_view_of_indoor_stadium_20260910165522.jpg", alt: "Before: stadium court with rubber marking and wear lanes" },
    after: { src: "/images/Indoor_sports_facility_view_20260910165522.jpg", alt: "After: stadium court deep cleaned and recoated" },
    cap: "Multi-court indoor stadium — deep clean and recoat staged across two nights.",
  },
];

const quotes = [
  { q: "They coated our main court over a long weekend and we were playing on Tuesday. No disruption to the timetable at all.", who: "Dana Whitcombe, Business Manager", org: "Kilbryde Grammar, Ringwood" },
  { q: "The inspection report was the first time anyone gave us a costed plan for the floor instead of a vague quote.", who: "Peter Nagle, Facilities Coordinator", org: "Shire of Barrandale, Colac" },
  { q: "Four courts, two nights, and the surface plays better than it has in a decade. Booked them for the next cycle on the spot.", who: "Sam Reddy, Venue Operations", org: "Northvale Indoor Sports, Craigieburn" },
];

const contactTicks = [
  "Most floors ready for use the next day",
  "Far lower cost than a full sand and refinish",
  "Protects the timber underneath, permanently",
  "Predictable annual cost you can budget",
];

const BadgeIcon = ({ children }: { children: React.ReactNode }) => (
  <span className="badge">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#438AD4" strokeWidth="1.8" aria-hidden="true">
      {children}
    </svg>
  </span>
);

export default function Home() {
  return (
    <main className="home" style={{ width: "100%", overflowX: "hidden" }}>
      {/* HERO */}
      <section id="top" className="hero">
        <div className="hero-bg">
          <Image src="/images/Empty_indoor_basketball_court_20260910165522.jpg" alt="Glossy freshly-coated timber basketball court" fill priority sizes="100vw" />
        </div>
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <span className="eyebrow">Victoria&apos;s Sports Floor Maintenance Specialists</span>
              <h1>
                Protect the floor <em>Victoria plays on</em>
              </h1>
              <p className="lead">
                We look after the timber floors Victoria plays on. A simple, scheduled recoat keeps your court safe, sharp and out of the way of a costly full sand — and we work
                around your timetable, not ours.
              </p>
              <div className="chips">
                {sectors.map((s) => (
                  <span className="chip" key={s}>
                    <Tick size={13} color="#E8A33D" />
                    {s}
                  </span>
                ))}
              </div>
              <div className="hero-actions">
                <Link href="#contact" className="efc-cta btn">
                  Request a Free Inspection
                  <Arrow size={16} color="#061A3D" />
                </Link>
                <Link href="#gallery" className="efc-outline-light btn">
                  See Before &amp; After
                </Link>
              </div>
            </div>

            <div className="hero-side">
              <div className="float float-b">
                <span className="ic">
                  <Clock size={20} color="#FFFFFF" />
                </span>
                <div>
                  <b>Next-morning play</b>
                  <span>Most floors ready the next day</span>
                </div>
              </div>
              <div className="float float-a">
                <span className="ic">
                  <Pin size={20} color="#061A3D" />
                </span>
                <div>
                  <b>Victoria-wide service</b>
                  <span>Metro and regional, same price per court</span>
                </div>
              </div>
            </div>
          </div>

          <div className="stats">
            {[
              ["40+", "Victorian schools"],
              ["18", "Councils looked after"],
              ["Next morning", "Back in play"],
              ["$20m", "Public liability · fully insured"],
            ].map(([b, s]) => (
              <div className="stat rv" key={s}>
                <b>{b}</b>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section id="why" className="sec sec-mist">
        <div className="wrap why-grid">
          <div>
            <span className="eyebrow rv">Why choose us</span>
            <h2 className="h2 rv">Your sports floor is one of your biggest assets</h2>
            <p className="lead rv" style={{ margin: "14px 0 0", lineHeight: 1.5 }}>
              Timber sports floors are all we do. A simple maintenance cycle keeps the coating intact, the surface safe underfoot and your courts ready to play.
            </p>
            <div className="why-photo">
              <Image
                src="/assets/photos/technician_coating_indoor_sports.jpg"
                alt="Technician applying a fresh coat to a timber sports court"
                width={1376}
                height={768}
                sizes="(max-width: 960px) 100vw, 560px"
              />
              <div className="note rv">
                <i />
                <p>
                  <strong>The maths:</strong> a scheduled recoat costs a fraction of a full re-sand — and a floor can only be sanded a handful of times in its life.
                </p>
              </div>
            </div>
          </div>
          <div className="benefits">
            {benefits.map((b, i) => (
              <div className="benefit rv" key={b.t}>
                <BadgeIcon>{b.icon}</BadgeIcon>
                {i === 0 ? (
                  <div>
                    <h3>{b.t}</h3>
                    <p>{b.p}</p>
                  </div>
                ) : (
                  <>
                    <h3>{b.t}</h3>
                    <p>{b.p}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="sec sec-navy on-dark">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow rv">Our services</span>
              <h2 className="h2 rv">Everything a timber court needs</h2>
            </div>
            <p className="rv">One specialist team, one point of contact — from annual inspection through to line marking.</p>
          </div>
          <div className="services">
            {serviceCards.map((s) => (
              <Link className="service rv" href={`/services/${s.slug}`} key={s.slug}>
                <BadgeIcon>{s.icon}</BadgeIcon>
                <h3>{s.t}</h3>
                <p>{s.p}</p>
                <span className="more">
                  More on this <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className="sec sec-white">
        <div className="wrap">
          <div style={{ marginBottom: 48 }}>
            <span className="eyebrow rv">Maintenance plans</span>
            <h2 className="h2 rv">Predictable annual cost. No surprises.</h2>
            <p className="lead rv" style={{ color: "#0D2961", margin: "18px 0 0", maxWidth: "60ch" }}>
              Choose a term and we lock the schedule, the scope and the price. Longer terms protect the floor best — and cost least per year.
            </p>
          </div>
          <div className="plans">
            {plans.map((p) => (
              <div className={`plan rv${p.gold ? " plan-gold" : ""}`} key={p.name}>
                {p.gold && <span className="ribbon">Best value</span>}
                <div>
                  <div className="plan-name">
                    <i style={{ background: p.dot }} />
                    <h3>{p.name}</h3>
                  </div>
                  <p className="desc">{p.desc}</p>
                </div>
                <div className="price">
                  <b>{p.price}</b>
                  <span>total over the {p.term} term · single court, ex GST</span>
                </div>
                <ul className="ticks">
                  {p.items.map((it) => (
                    <li key={it}>
                      <Tick size={16} color={p.gold ? "#E8A33D" : "#438AD4"} />
                      {it}
                    </li>
                  ))}
                </ul>
                <Link href="#contact" className={p.gold ? "efc-cta" : "efc-outline-dark"}>
                  Enquire about {p.name}
                </Link>
              </div>
            ))}
          </div>
          <p className="fine rv">
            Figures shown are indicative for a single full-size court, ex GST. We&apos;ll quote your floor properly after the inspection — size, condition and access all change the
            job. Multi-court venues get a bundled rate.
          </p>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="sec sec-royal on-dark">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow rv">Before &amp; after</span>
              <h2 className="h2 rv">The same floor, one visit apart</h2>
            </div>
            <Link href="/gallery" className="efc-outline-amber btn btn-sm rv">
              See the full gallery
            </Link>
          </div>
          <div className="pairs">
            {pairs.map((p) => (
              <div key={p.cap}>
                <div className="pair">
                  <figure className="rv">
                    <Image src={p.before.src} alt={p.before.alt} fill sizes="(max-width: 600px) 100vw, 620px" />
                    <figcaption>Before</figcaption>
                  </figure>
                  <figure className="after rv">
                    <Image src={p.after.src} alt={p.after.alt} fill sizes="(max-width: 600px) 100vw, 620px" />
                    <figcaption>After</figcaption>
                  </figure>
                </div>
                <p className="pair-cap rv">{p.cap}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="sec sec-navy on-dark">
        <div className="wrap">
          <span className="eyebrow rv">What clients say</span>
          <div className="quotes">
            {quotes.map((q) => (
              <blockquote className="quote rv" key={q.who}>
                <span className="mark" aria-hidden="true">
                  “
                </span>
                <p>{q.q}</p>
                <footer>
                  <strong>{q.who}</strong>
                  <span>{q.org}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="sec sec-mist">
        <div className="wrap contact-grid">
          <div>
            <span className="eyebrow rv">Free inspection</span>
            <h2 className="h2 rv">Book a free floor inspection</h2>
            <p className="lead rv" style={{ margin: "18px 0 30px", maxWidth: "46ch" }}>
              We&apos;ll assess the coating, the line marking and the timber, then send a written report with a costed recommendation. No obligation.
            </p>
            <ul className="ticks rv" style={{ gap: 14, fontSize: 16 }}>
              {contactTicks.map((t) => (
                <li key={t}>
                  <Tick size={18} color="#143781" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="contact-card rv">
              <a href={site.phoneHref} className="tel">
                {site.phone}
              </a>
              <a href={`mailto:${site.email}`} style={{ color: "#143781", fontSize: 16 }}>
                {site.email}
              </a>
              <span style={{ color: "#0D2961", fontSize: 14 }}>
                {site.address.street}, {site.address.locality} {site.address.region} {site.address.postcode}
              </span>
            </div>
          </div>
          <EnquiryForm />
        </div>
      </section>
    </main>
  );
}
