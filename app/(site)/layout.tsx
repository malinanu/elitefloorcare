import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { getServiceList, getSettings, telHref } from "@/lib/cms";
import "./globals.css";
import "@/styles/home.css";
import "@/styles/form.css";
import "@/styles/inner.css";
import "@/styles/about.css";

export const dynamic = "force-dynamic"; // content comes from the CMS at request time (cached; see lib/cms.ts)

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitesportsfloorcare.com.au";

const barlow = Barlow({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-barlow", display: "swap" });
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Elite Sports Floor Care — Victoria's Sports Floor Maintenance Specialists",
    template: "%s — Elite Sports Floor Care",
  },
  description:
    "Elite Sports Floor Care protects the timber sports floors Victorian schools, stadiums, gyms, recreation centres and community halls play on — preventative maintenance, recoating, deep cleaning, line marking and free floor inspections.",
  openGraph: { type: "website", locale: "en_AU", siteName: "Elite Sports Floor Care", images: ["/images/Empty_indoor_basketball_court_20260910165522.jpg"] },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#061A3D" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [site, services] = await Promise.all([getSettings(), getServiceList()]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.name,
    legalName: site.legalName,
    url: SITE_URL,
    telephone: `+61 ${site.phone}`,
    email: site.email,
    image: `${SITE_URL}/images/Empty_indoor_basketball_court_20260910165522.jpg`,
    logo: `${SITE_URL}/assets/logo-dark-bg.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.street,
      addressLocality: site.locality,
      addressRegion: site.region,
      postalCode: site.postcode,
      addressCountry: "AU",
    },
    areaServed: { "@type": "State", name: "Victoria, Australia" },
    description: site.tagline,
  };
  return (
    <html lang="en-AU" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <body>
        <a href="#main" className="sr-only-skip">
          Skip to content
        </a>
        <Header services={services} phone={site.phone} phoneHref={telHref(site.phone)} siteName={site.name} />
        <div id="main">{children}</div>
        <Footer />
        <Reveal />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
