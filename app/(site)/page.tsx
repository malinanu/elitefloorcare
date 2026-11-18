import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import EnquiryForm from "@/components/EnquiryForm";
import { Arrow, KeyIcon, Tick } from "@/components/icons";
import { getHome, getPlans, getServiceList, getSettings, getTestimonials, pic, telHref } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  const h = await getHome();
  return {
    ...(h.metaTitle ? { title: { absolute: h.metaTitle } } : {}),
    ...(h.metaDescription ? { description: h.metaDescription } : {}),
  };
}

const DOT: Record<string, string> = { steel: "#96ACC6", blue: "#438AD4", amber: "#E8A33D" };

const Badge = ({ icon }: { icon: string }) => (
  <span className="badge">
    <KeyIcon name={icon} />
  </span>
);

export default async function Home() {
  const [h, site, services, plans, quotes] = await Promise.all([getHome(), getSettings(), getServiceList(), getPlans(), getTestimonials()]);
  const hero = pic(h.heroImage);
  const why = pic(h.whyImage);
  const [noteLead, ...noteRest] = h.whyNote.split(":");

  return (
    <main className="home" style={{ width: "100%", overflowX: "hidden" }}>
      {/* HERO */}
      <section id="top" className="hero">
        <div className="hero-bg">
          <Image src={hero.src} alt={hero.alt} fill priority sizes="100vw" />
        </div>
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <span className="eyebrow">{h.heroEyebrow}</span>
              <h1>
                {h.heroTitle} <em>{h.heroHighlight}</em>
              </h1>
              <p className="lead">{h.heroLead}</p>
              <div className="chips">
                {(site.sectors ?? []).map((s) => (
                  <span className="chip" key={s.id ?? s.label}>
                    <Tick size={13} color="#E8A33D" />
                    {s.label}
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
              {(h.floats ?? []).map((f, i) => (
                <div className={`float ${i === 0 ? "float-b" : "float-a"}`} key={f.id ?? f.title}>
                  <span className="ic">
                    <KeyIcon name={f.icon} size={20} color={i === 0 ? "#FFFFFF" : "#061A3D"} sw={2} />
                  </span>
                  <div>
                    <b>{f.title}</b>
                    <span>{f.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="stats">
            {(h.stats ?? []).map((s) => (
              <div className="stat rv" key={s.id ?? s.label}>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section id="why" className="sec sec-mist">
        <div className="wrap why-grid">
          <div>
            <span className="eyebrow rv">{h.whyEyebrow}</span>
            <h2 className="h2 rv">{h.whyTitle}</h2>
            <p className="lead rv" style={{ margin: "14px 0 0", lineHeight: 1.5 }}>
              {h.whyLead}
            </p>
            <div className="why-photo">
              <Image src={why.src} alt={why.alt} width={why.width ?? 1376} height={why.height ?? 768} sizes="(max-width: 960px) 100vw, 560px" />
              <div className="note rv">
                <i />
                <p>
                  {noteRest.length ? (
                    <>
                      <strong>{noteLead}:</strong>
                      {noteRest.join(":")}
                    </>
                  ) : (
                    h.whyNote
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="benefits">
            {(h.benefits ?? []).map((b, i) => (
              <div className="benefit rv" key={b.id ?? b.title}>
                <Badge icon={b.icon} />
                {i === 0 ? (
                  <div>
                    <h3>{b.title}</h3>
                    <p>{b.text}</p>
                  </div>
                ) : (
                  <>
                    <h3>{b.title}</h3>
                    <p>{b.text}</p>
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
              <span className="eyebrow rv">{h.servicesEyebrow}</span>
              <h2 className="h2 rv">{h.servicesTitle}</h2>
            </div>
            <p className="rv">{h.servicesIntro}</p>
          </div>
          <div className="services">
            {services.map((s) => (
              <Link className="service rv" href={`/services/${s.slug}`} key={s.slug}>
                <Badge icon={s.icon} />
                <h3>{s.title}</h3>
                <p>{s.summary}</p>
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
            <span className="eyebrow rv">{h.plansEyebrow}</span>
            <h2 className="h2 rv">{h.plansTitle}</h2>
            <p className="lead rv" style={{ color: "#0D2961", margin: "18px 0 0", maxWidth: "60ch" }}>
              {h.plansLead}
            </p>
          </div>
          <div className="plans">
            {plans.map((p) => (
              <div className={`plan rv${p.featured ? " plan-gold" : ""}`} key={p.id}>
                {p.featured && p.ribbon && <span className="ribbon">{p.ribbon}</span>}
                <div>
                  <div className="plan-name">
                    <i style={{ background: DOT[p.colour ?? "blue"] }} />
                    <h3>{p.name}</h3>
                  </div>
                  <p className="desc">{p.description}</p>
                </div>
                <div className="price">
                  <b>{p.price}</b>
                  <span>total over the {p.term} term · single court, ex GST</span>
                </div>
                <ul className="ticks">
                  {(p.items ?? []).map((it) => (
                    <li key={it.id ?? it.text}>
                      <Tick size={16} color={p.featured ? "#E8A33D" : "#438AD4"} />
                      {it.text}
                    </li>
                  ))}
                </ul>
                <Link href="#contact" className={p.featured ? "efc-cta" : "efc-outline-dark"}>
                  Enquire about {p.name}
                </Link>
              </div>
            ))}
          </div>
          <p className="fine rv">{h.plansFine}</p>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="sec sec-royal on-dark">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow rv">{h.galleryEyebrow}</span>
              <h2 className="h2 rv">{h.galleryTitle}</h2>
            </div>
            <Link href="/gallery" className="efc-outline-amber btn btn-sm rv">
              {h.galleryButton}
            </Link>
          </div>
          <div className="pairs">
            {(h.pairs ?? []).map((p) => {
              const b = pic(p.before);
              const a = pic(p.after);
              return (
                <div key={p.id ?? p.caption}>
                  <div className="pair">
                    <figure className="rv">
                      <Image src={b.src} alt={b.alt} fill sizes="(max-width: 600px) 100vw, 620px" />
                      <figcaption>Before</figcaption>
                    </figure>
                    <figure className="after rv">
                      <Image src={a.src} alt={a.alt} fill sizes="(max-width: 600px) 100vw, 620px" />
                      <figcaption>After</figcaption>
                    </figure>
                  </div>
                  {p.caption && <p className="pair-cap rv">{p.caption}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {quotes.length > 0 && (
        <section className="sec sec-navy on-dark">
          <div className="wrap">
            <span className="eyebrow rv">{h.testimonialsEyebrow}</span>
            <div className="quotes">
              {quotes.map((q) => (
                <blockquote className="quote rv" key={q.id}>
                  <span className="mark" aria-hidden="true">
                    “
                  </span>
                  <p>{q.quote}</p>
                  <footer>
                    <strong>{q.person}</strong>
                    <span>{q.organisation}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section id="contact" className="sec sec-mist">
        <div className="wrap contact-grid">
          <div>
            <span className="eyebrow rv">{h.contactEyebrow}</span>
            <h2 className="h2 rv">{h.contactTitle}</h2>
            <p className="lead rv" style={{ margin: "18px 0 30px", maxWidth: "46ch" }}>
              {h.contactLead}
            </p>
            <ul className="ticks rv" style={{ gap: 14, fontSize: 16 }}>
              {(h.contactTicks ?? []).map((t) => (
                <li key={t.id ?? t.text}>
                  <Tick size={18} color="#143781" />
                  {t.text}
                </li>
              ))}
            </ul>
            <div className="contact-card rv">
              <a href={telHref(site.phone)} className="tel">
                {site.phone}
              </a>
              <a href={`mailto:${site.email}`} style={{ color: "#143781", fontSize: 16 }}>
                {site.email}
              </a>
              <span style={{ color: "#0D2961", fontSize: 14 }}>
                {site.street}, {site.locality} {site.region} {site.postcode}
              </span>
            </div>
          </div>
          <EnquiryForm />
        </div>
      </section>
    </main>
  );
}
