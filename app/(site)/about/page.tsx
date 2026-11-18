import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Arrow, Cross, KeyIcon, Pin, Tick } from "@/components/icons";
import { getAbout, pic } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  const a = await getAbout();
  return { title: "About", description: a.metaDescription || a.heroLead, alternates: { canonical: "/about" } };
}

export default async function AboutPage() {
  const a = await getAbout();
  const hero = pic(a.heroImage);
  const story = pic(a.storyImage);

  return (
    <main className="ab">
      {/* HERO */}
      <section className="ab-hero">
        <div className="ab-hero-bg">
          <Image src={hero.src} alt={hero.alt} fill priority sizes="100vw" />
        </div>
        <div className="wrap">
          <nav className="ab-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <b aria-current="page">About</b>
          </nav>
          <h1>
            {a.heroTitle} <em>{a.heroHighlight}</em>
          </h1>
          <p>{a.heroLead}</p>
          <Link href="/#contact" className="efc-cta ab-btn">
            Request a Free Inspection
            <Arrow size={16} color="#061A3D" />
          </Link>
          <div className="ab-stats">
            {(a.stats ?? []).map((s) => (
              <div className="ab-stat" key={s.id ?? s.label}>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="ab-sec ab-mist">
        <div className="wrap ab-story">
          <div className="ab-photo rv">
            <Image src={story.src} alt={story.alt} width={story.width ?? 1200} height={story.height ?? 896} sizes="(max-width: 1000px) 460px, 480px" />
            <div className="ab-badge">
              <i>
                <Pin size={20} color="#B9791C" />
              </i>
              <div>
                <b>{a.badgeTitle}</b>
                <span>{a.badgeText}</span>
              </div>
            </div>
          </div>
          <div>
            <span className="ab-eyebrow rv">{a.storyEyebrow}</span>
            <h2 className="ab-h2 rv">{a.storyTitle}</h2>
            <p className="ab-lead rv">{a.storyLead}</p>
            <span className="ab-saw-label rv">{a.sawLabel}</span>
            <div className="ab-saw">
              {(a.saw ?? []).map((s) => (
                <div className="rv" key={s.id ?? s.text}>
                  <i>
                    <Cross size={14} color="#B9791C" />
                  </i>
                  {s.text}
                </div>
              ))}
            </div>
            <p className="ab-text rv">{a.storyText}</p>
            <div className="ab-quote rv">
              <i />
              <div>
                <b>{a.quoteTitle}</b>
                <span>{a.quoteText}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY DIFFERENT */}
      <section className="ab-sec ab-white">
        <div className="wrap ab-why">
          <div className="ab-why-head">
            <span className="ab-eyebrow rv">{a.whyEyebrow}</span>
            <h2 className="ab-h2 rv">{a.whyTitle}</h2>
          </div>
          <div className="ab-cards">
            {(a.cards ?? []).map((c) => (
              <div className="ab-card rv" key={c.id ?? c.title}>
                <span className="ic">
                  <KeyIcon name={c.icon} size={26} />
                </span>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
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
              <span className="ab-eyebrow rv">{a.accrEyebrow}</span>
              <h2 className="ab-h2 rv">{a.accrTitle}</h2>
            </div>
            <p className="rv">{a.accrText}</p>
          </div>
          <div className="ab-accr">
            {(a.accreditations ?? []).map((x) => (
              <div className="rv" key={x.id ?? x.title}>
                <i>
                  <Tick size={18} color="#E8A33D" />
                </i>
                <small>{x.kind}</small>
                <b>{x.title}</b>
                <span>{x.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CREW */}
      <section className="ab-sec ab-mist">
        <div className="wrap">
          <span className="ab-eyebrow rv">{a.crewEyebrow}</span>
          <h2 className="ab-h2 rv">{a.crewTitle}</h2>
          <div className="ab-crew">
            {(a.crew ?? []).map((c) => {
              const im = pic(c.image);
              return (
                <figure className="rv" key={c.id ?? c.caption}>
                  <Image src={im.src} alt={im.alt} fill sizes="(max-width: 1000px) 50vw, 300px" />
                  <figcaption>{c.caption}</figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ab-sec ab-navy ab-dark ab-cta-sec">
        <div className="wrap">
          <div className="ab-cta rv">
            <div>
              <h2>{a.cta.title}</h2>
              <p>{a.cta.text}</p>
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
