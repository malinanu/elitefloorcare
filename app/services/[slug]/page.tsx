import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RecoatDepth from "@/components/RecoatDepth";
import { BeforeAfterPair, CrossSell, CtaBand, PhotoHero, TickList } from "@/components/inner";
import { serviceContent } from "@/content/services";
import { services, type ServiceSlug } from "@/content/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

const get = (slug: string) => (slug in serviceContent ? serviceContent[slug as ServiceSlug] : null);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = get((await params).slug);
  if (!s) return {};
  return {
    title: s.metaTitle.replace(/\s+—\s+Elite Sports Floor Care$/, ""),
    description: s.metaDescription,
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: { images: [s.hero.image] },
  };
}

export default async function ServicePage({ params }: Props) {
  const s = get((await params).slug);
  if (!s) notFound();

  return (
    <main className="pg">
      <PhotoHero
        image={s.hero.image}
        alt={s.hero.alt}
        title={s.hero.title}
        lead={s.hero.lead}
        crumbs={[{ href: "/", label: "Home" }, { href: "/#services", label: "Services" }, { label: s.hero.crumb }]}
      />

      {/* what it involves */}
      <section className="ps ps-mist">
        <div className="pg-wrap pg-split">
          <div>
            <span className="pg-eyebrow rv">{s.involves.eyebrow}</span>
            <h2 className="pg-h2 rv">{s.involves.title}</h2>
            {s.involves.paragraphs.map((p, i) => (
              <p key={i} className="pg-p rv" dangerouslySetInnerHTML={{ __html: p }} />
            ))}
          </div>
          <div className="pg-card rv">
            <h3>{s.involves.card.title}</h3>
            <TickList items={s.involves.card.items} />
            {s.involves.card.note && (
              <div className="pg-note">
                <p dangerouslySetInnerHTML={{ __html: s.involves.card.note }} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* recoating only: wear-layer depth model */}
      {s.depth && (
        <section className="ps ps-mist">
          <div className="pg-wrap pg-split pg-split--center">
            <div className="pg-panel rv">
              <span className="pg-panel-tag">{s.depth.figLabel}</span>
              <RecoatDepth title={s.depth.iframeTitle} fallbackSrc={s.depth.staticImage} fallbackAlt={s.depth.staticAlt} />
            </div>
            <div>
              <span className="pg-eyebrow rv">{s.depth.eyebrow}</span>
              <h2 className="pg-h2 rv">{s.depth.title}</h2>
              <p className="pg-p rv" style={{ marginBottom: 22 }} dangerouslySetInnerHTML={{ __html: s.depth.body }} />
              <ul className="pg-legend rv">
                {s.depth.legend.map((l, i) => (
                  <li key={l}>
                    <span
                      style={
                        [
                          { background: "#E8A33D" },
                          { background: "rgba(67,138,212,0.35)", border: "1px solid #438AD4" },
                          { background: "rgba(232,163,61,0.08)", border: "1px solid #E8A33D" },
                        ][i]
                      }
                    />
                    {l}
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
            {s.steps.items.map((st) => (
              <li key={st.n} className={`pg-step rv${st.accent ? " pg-step--accent" : ""}`}>
                <span className="pg-step-n" aria-hidden="true">
                  {st.n}
                </span>
                <h3>{st.title}</h3>
                <p dangerouslySetInnerHTML={{ __html: st.text }} />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* audience */}
      <section className="ps ps-sm ps-navy2">
        <div className="pg-wrap pg-band">
          <h2 className="rv">{s.audience.title}</h2>
          <div className="pg-chips rv">
            {s.audience.chips.map((c) => (
              <span className="pg-chip" key={c}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* before & after */}
      <section className="ps ps-white">
        <div className="pg-wrap">
          <div className="pg-head">
            <div>
              <span className="pg-eyebrow rv">{s.beforeAfter.eyebrow}</span>
              <h2 className="pg-h2 pg-h2--flush rv">{s.beforeAfter.title}</h2>
            </div>
            <Link href="/gallery" className="efc-outline-dark pg-btn pg-btn-sm rv">
              {s.beforeAfter.button}
            </Link>
          </div>
          <div className="pg-pairs">
            {s.beforeAfter.pairs.map((p) => (
              <div key={p.before.src + p.after.src}>
                <BeforeAfterPair before={p.before} after={p.after} labels={p.labels} />
                {p.caption && <p className="pg-cap rv">{p.caption}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CrossSell current={s.slug} eyebrow={s.crossSell.eyebrow} />
      <CtaBand title={s.cta.title} text={s.cta.text} />
    </main>
  );
}
