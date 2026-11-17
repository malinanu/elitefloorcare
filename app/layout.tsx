import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { site } from "@/content/site";
import "./globals.css";
import "@/styles/home.css";
import "@/styles/form.css";
import "@/styles/inner.css";
import "@/styles/about.css";

const barlow = Barlow({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-barlow", display: "swap" });
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Elite Sports Floor Care — Victoria's Sports Floor Maintenance Specialists",
    template: "%s — Elite Sports Floor Care",
  },
  description:
    "Elite Sports Floor Care protects the timber sports floors Victorian schools, stadiums, gyms, recreation centres and community halls play on — preventative maintenance, recoating, deep cleaning, line marking and free floor inspections.",
  openGraph: { type: "website", locale: "en_AU", siteName: site.name, images: ["/images/Empty_indoor_basketball_court_20260910165522.jpg"] },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#061A3D" };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: site.name,
  legalName: site.legalName,
  url: site.url,
  telephone: "+61 1300 353 667",
  email: site.email,
  image: `${site.url}/images/Empty_indoor_basketball_court_20260910165522.jpg`,
  logo: `${site.url}/assets/logo-dark-bg.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.locality,
    addressRegion: site.address.region,
    postalCode: site.address.postcode,
    addressCountry: site.address.country,
  },
  areaServed: { "@type": "State", name: "Victoria, Australia" },
  description: site.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <body>
        <a href="#main" className="sr-only-skip">
          Skip to content
        </a>
        <Header />
        <div id="main">{children}</div>
        <Footer />
        <Reveal />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
