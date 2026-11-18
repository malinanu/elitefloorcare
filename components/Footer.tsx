import Image from "next/image";
import Link from "next/link";
import { getServiceList, getSettings, telHref } from "@/lib/cms";

export default async function Footer() {
  const [s, services] = await Promise.all([getSettings(), getServiceList()]);
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div className="rv">
            <Image src="/assets/logo-dark-bg.png" alt={`${s.name} — Sports Floor Specialist`} width={140} height={64} />
            <p style={{ color: "var(--steel)", fontSize: 14, lineHeight: 1.6, margin: "18px 0 0", maxWidth: "32ch" }}>{s.tagline}</p>
          </div>
          <div className="rv">
            <h3>Who we look after</h3>
            <div className="col">
              {(s.sectors ?? []).map((x) => (
                <span key={x.id ?? x.label}>{x.label.charAt(0) + x.label.slice(1).toLowerCase()}</span>
              ))}
            </div>
          </div>
          <div className="rv">
            <h3>Services</h3>
            <div className="col">
              {services.map((x) => (
                <Link key={x.slug} href={`/services/${x.slug}`} className="foot-link">
                  {x.footerLabel}
                </Link>
              ))}
            </div>
          </div>
          <div className="rv">
            <h3>Get in touch</h3>
            <div className="col">
              <a href={telHref(s.phone)} className="foot-tel">
                {s.phone}
              </a>
              <a href={`mailto:${s.email}`} className="foot-link">
                {s.email}
              </a>
              <span>
                {s.street}
                <br />
                {s.locality} {s.region} {s.postcode}
              </span>
              <Link href="/service-areas" className="foot-link">
                Servicing all of Victoria
              </Link>
              <span>ABN {s.abn}</span>
            </div>
          </div>
        </div>
        <div className="foot-bottom">
          <span>
            © {new Date().getFullYear()} {s.legalName}
          </span>
          <span>{s.footerNote}</span>
        </div>
      </div>
    </footer>
  );
}
