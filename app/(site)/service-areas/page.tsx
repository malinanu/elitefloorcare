import type { Metadata } from "next";
import { CtaBand, PlainHero, TickList } from "@/components/inner";
import { getServiceAreasPage, getSettings } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getServiceAreasPage();
  return { title: p.title, description: p.metaDescription || p.lead, alternates: { canonical: "/service-areas" } };
}

export default async function ServiceAreasPage() {
  const [p, site] = await Promise.all([getServiceAreasPage(), getSettings()]);
  return (
    <main className="pg">
      <PlainHero title={p.title} lead={p.lead} crumbs={[{ href: "/", label: "Home" }, { label: p.title }]} />

      <section className="ps ps-mist">
        <div className="pg-wrap pg-split pg-split--center">
          <div className="pg-panel pg-diagram rv">
            <div className="pg-rings" role="img" aria-label={`Coverage diagram: ${site.locality} workshop at the centre, crews covering all of Victoria`}>
              <span className="r1" />
              <span className="r2" />
              <span className="r3" />
              <span className="hx" />
              <span className="vx" />
              <span className="dot" />
              <span className="lbl lbl-home">{site.locality}</span>
              <span className="lbl lbl-vic">Victoria-wide</span>
            </div>
            <p>Coverage diagram · not to scale</p>
          </div>
          <div>
            <span className="pg-eyebrow rv">{p.coverageEyebrow}</span>
            <h2 className="pg-h2 rv">{p.coverageTitle}</h2>
            <p className="pg-p rv" style={{ marginBottom: 26 }}>
              {p.coverageText}
            </p>
            <div className="rv">
              <TickList large color="#143781" items={(p.coverageTicks ?? []).map((t) => t.text)} />
            </div>
          </div>
        </div>
      </section>

      <section className="ps ps-white">
        <div className="pg-wrap">
          <span className="pg-eyebrow rv">{p.timesEyebrow}</span>
          <h2 className="pg-h2 pg-h2--sm rv">{p.timesTitle}</h2>
          <div className="pg-tiles">
            {(p.times ?? []).map((t) => (
              <div className="pg-tile rv" key={t.id ?? t.kind}>
                <small>{t.kind}</small>
                <b>{t.value}</b>
                <p>{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title={p.cta.title} text={p.cta.text} />
    </main>
  );
}
