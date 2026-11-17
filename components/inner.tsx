import Image from "next/image";
import Link from "next/link";
import { crossSell, type ServiceSlug } from "@/content/site";
import { RawIcon, Tick } from "./icons";

type Crumb = { href?: string; label: string };

export function Crumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="pg-crumbs" aria-label="Breadcrumb">
      {items.map((c, i) => (
        <span key={c.label} style={{ display: "contents" }}>
          {i > 0 && <span aria-hidden="true">/</span>}
          {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function PhotoHero({ image, alt, title, lead, crumbs }: { image: string; alt: string; title: string; lead: string; crumbs: Crumb[] }) {
  return (
    <section className="pg-hero">
      <div className="pg-hero-bg">
        <Image src={image} alt={alt} fill priority sizes="100vw" />
      </div>
      <div className="pg-hero-shade" />
      <div className="pg-hero-inner">
        <Crumbs items={crumbs} />
        <h1>{title}</h1>
        <p className="pg-hero-lead" dangerouslySetInnerHTML={{ __html: lead }} />
        <div>
          <Link href="/#contact" className="efc-cta pg-btn">
            Request a Free Inspection
          </Link>
        </div>
      </div>
    </section>
  );
}

export function PlainHero({ title, lead, crumbs }: { title: string; lead: string; crumbs: Crumb[] }) {
  return (
    <section className="pg-hero pg-hero--plain">
      <div className="pg-hero-inner">
        <Crumbs items={crumbs} />
        <h1>{title}</h1>
        <p className="pg-hero-lead">{lead}</p>
      </div>
    </section>
  );
}

export function TickList({ items, large, color = "#438AD4" }: { items: string[]; large?: boolean; color?: string }) {
  return (
    <ul className={`pg-list${large ? " pg-list--lg" : ""}`}>
      {items.map((it) => (
        <li key={it}>
          <Tick size={large ? 18 : 17} color={color} />
          {it}
        </li>
      ))}
    </ul>
  );
}

export type Pic = { src: string; alt: string };

export function BeforeAfterPair({ before, after, labels = ["Before", "After"], sizes = "(max-width: 640px) 100vw, 610px" }: { before: Pic; after: Pic; labels?: string[]; sizes?: string }) {
  return (
    <div className="pg-pair">
      <figure className="pg-fig rv">
        <Image src={before.src} alt={before.alt} fill sizes={sizes} />
        <figcaption>{labels[0]}</figcaption>
      </figure>
      <figure className="pg-fig pg-fig--after rv">
        <Image src={after.src} alt={after.alt} fill sizes={sizes} />
        <figcaption>{labels[1]}</figcaption>
      </figure>
    </div>
  );
}

export function CrossSell({ current, eyebrow = "Also from us" }: { current: ServiceSlug; eyebrow?: string }) {
  const others = (Object.keys(crossSell) as ServiceSlug[]).filter((s) => s !== current);
  return (
    <section className="ps ps-sm ps-mist">
      <div className="pg-wrap">
        <span className="pg-eyebrow rv">{eyebrow}</span>
        <div className="pg-xs">
          {others.map((slug) => {
            const c = crossSell[slug];
            return (
              <Link key={slug} href={`/services/${slug}`} className="pg-xs-card rv">
                <RawIcon paths={c.icon} />
                <span className="pg-xs-title">{c.title}</span>
                <span className="pg-xs-tag">{c.tagline} →</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function CtaBand({ title, text }: { title: string; text: string }) {
  return (
    <section className="ps ps-cta ps-navy">
      <div className="pg-wrap pg-cta">
        <div className="rv">
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <Link href="/#contact" className="efc-cta pg-btn pg-btn-lg rv">
          Request a Free Inspection
        </Link>
      </div>
    </section>
  );
}
