import Image from "next/image";
import Link from "next/link";
import { services, site } from "@/content/site";

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div className="rv">
            <Image src="/assets/logo-dark-bg.png" alt="Elite Floor Care — Sports Floor Specialist" width={140} height={64} />
            <p style={{ color: "var(--steel)", fontSize: 14, lineHeight: 1.6, margin: "18px 0 0", maxWidth: "32ch" }}>{site.tagline}</p>
          </div>
          <div className="rv">
            <h3>Who we look after</h3>
            <div className="col">
              <span>Schools</span>
              <span>Stadiums</span>
              <span>Gyms</span>
              <span>Recreation centres</span>
              <span>Community halls</span>
            </div>
          </div>
          <div className="rv">
            <h3>Services</h3>
            <div className="col">
              {services.map((s) => (
                <Link key={s.slug} href={`/services/${s.slug}`} className="foot-link">
                  {s.footer}
                </Link>
              ))}
            </div>
          </div>
          <div className="rv">
            <h3>Get in touch</h3>
            <div className="col">
              <a href={site.phoneHref} className="foot-tel">
                {site.phone}
              </a>
              <a href={`mailto:${site.email}`} className="foot-link">
                {site.email}
              </a>
              <span>
                {site.address.street}
                <br />
                {site.address.locality} {site.address.region} {site.address.postcode}
              </span>
              <Link href="/service-areas" className="foot-link">
                Servicing all of Victoria
              </Link>
              <span>ABN {site.abn}</span>
            </div>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} {site.legalName}</span>
          <span>Fully insured · $20m public liability · Timber sports floors only</span>
        </div>
      </div>
    </footer>
  );
}
