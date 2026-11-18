import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import RecoatDepth from "@/components/RecoatDepth";
import { BeforeAfterPair, CrossSell, CtaBand, PhotoHero, TickList } from "@/components/inner";
import { getService, getServiceList, getSettings, pic } from "@/lib/cms";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getService((await params).slug);
  if (!s) return {};
  return {
    title: s.metaTitle || s.title,
    description: s.metaDescription || s.lead,
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: { images: [pic(s.heroImage).src] },
  };
}

const LEGEND = [
  { background: "#E8A33D" },
  { background: "rgba(67,138,212,0.35)", border: "1px solid #438AD4" },
  { background: "rgba(232,163,61,0.08)", border: "1px solid #E8A33D" },
];

export default async function ServicePage({ params }: Props) {
  const slug = (await params).slug;
  const [s, all, site] = await Promise.all([getService(slug), getServiceList(), getSettings()]);
  if (!s) notFound();
  const hero = pic(s.heroImage);
  const d = s.depth;

  return (
    <main className="pg">
      <PhotoHero
        image={hero.src}
        alt={hero.alt}
        title={s.title}
        lead={s.lead}
        crumbs={[{ href: "/", label: "Home" }, { href: "/#services", label: "Services" }, { label: s.crumb }]}
      />

      {/* what it involves */}
      <section className="ps ps-mist">
        <div className="pg-wrap pg-split">
          <div>
            <span className="pg-eyebrow rv">{s.involves.eyebrow}</span>
            <h2 className="pg-h2 rv">{s.involves.title}</h2>
            <div className="pg-rich rv">
              <RichText data={s.involves.body} />
            </div>
          </div>
          <div className="pg-card rv">
            <h3>{s.involves.cardTitle}</h3>
            <TickList items={(s.involves.items ?? []).map((i) => i.text)} />
            {s.involves.note && (
              <div className="pg-note">
                <RichText data={s.involves.note} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* optional wear-layer depth model */}
      {d?.enabled && (
        <section className="ps ps-mist">
          <div className="pg-wrap pg-split pg-split--center">
            <div className="pg-panel rv">
              {d.figLabel && <span className="pg-panel-tag">{d.figLabel}</span>}
              <RecoatDepth title={d.title ?? "Wear-layer depth model"} fallbackSrc={pic(d.fallbackImage).src} fallbackAlt={pic(d.fallbackImage).alt} />
            </div>
            <div>
              {d.eyebrow && <span className="pg-eyebrow rv">{d.eyebrow}</span>}
              {d.title && <h2 className="pg-h2 rv">{d.title}</h2>}
              {d.body && (
                <p className="pg-p rv" style={{ marginBottom: 22 }}>
                  {d.body}
                </p>
              )}
              <ul className="pg-legend rv">
                {(d.legend ?? []).map((l, i) => (
                  <li key={l.id ?? l.text}>
                    <span style={LEGEND[i] ?? LEGEND[0]} />
                    {l.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* steps */}
      <section className="ps ps-white">
        <div className="pg-wrap">
          <span className="pg-eyebrow rv">{s.steps.eyebrow}</span>
          <h2 className="pg-h2 pg-h2--steps rv">{s.steps.title}</h2>
          <ol className="pg-steps" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {(s.steps.items ?? []).map((st, i) => (
              <li key={st.id ?? st.title} className={`pg-step rv${st.accent ? " pg-step--accent" : ""}`}>
                <span className="pg-step-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{st.title}</h3>
                <p>{st.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* audience */}
      <section className="ps ps-sm ps-navy2">
        <div className="pg-wrap pg-band">
          <h2 className="rv">{s.audienceTitle}</h2>
          <div className="pg-chips rv">
            {(site.sectors ?? []).map((c) => (
              <span className="pg-chip" key={c.id ?? c.label}>
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* before & after */}
      {(s.beforeAfter.pairs ?? []).length > 0 && (
        <section className="ps ps-white">
          <div className="pg-wrap">
            <div className="pg-head">
              <div>
                <span className="pg-eyebrow rv">{s.beforeAfter.eyebrow}</span>
                <h2 className="pg-h2 pg-h2--flush rv">{s.beforeAfter.title}</h2>
              </div>
              <Link href="/gallery" className="efc-outline-dark pg-btn pg-btn-sm rv">
                {s.beforeAfter.buttonLabel || "Full gallery"}
              </Link>
            </div>
            <div className="pg-pairs">
              {(s.beforeAfter.pairs ?? []).map((p) => (
                <div key={p.id}>
                  <BeforeAfterPair before={pic(p.before)} after={pic(p.after)} labels={[p.beforeLabel || "Before", p.afterLabel || "After"]} />
                  {p.caption && <p className="pg-cap rv">{p.caption}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <CrossSell current={s.slug} services={all} eyebrow={s.crossSellEyebrow || "Also from us"} />
      <CtaBand title={s.ctaTitle || "Ready to protect your floor?"} text={s.ctaText || ""} />
    </main>
  );
}
