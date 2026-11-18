import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const services = ["preventative-maintenance", "recoating", "deep-cleaning", "court-line-marking", "floor-inspections"];

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  // The SQLite driver picks its native binary at runtime (require(`@libsql/${platform}`)),
  // which the file tracer can't see. Ship the driver and whichever platform builds are installed.
  serverExternalPackages: ["libsql"],
  outputFileTracingIncludes: {
    "/**": ["./node_modules/@libsql/linux-*/**/*", "./node_modules/@libsql/darwin-*/**/*", "./cms/seed-data/**/*"],
  },
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1280, 1600, 1920, 2400],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Payload serves uploads from /api/media/file/<name>
    localPatterns: [{ pathname: "/api/media/file/**" }, { pathname: "/assets/**" }, { pathname: "/images/**" }],
  },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Keep every URL from the old static site working (links, bookmarks, search rankings).
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/index-hero-a.html", destination: "/", permanent: true },
      { source: "/about.html", destination: "/about", permanent: true },
      { source: "/about-previous.html", destination: "/about", permanent: true },
      { source: "/gallery.html", destination: "/gallery", permanent: true },
      { source: "/service-areas.html", destination: "/service-areas", permanent: true },
      { source: "/recoat-depth.html", destination: "/services/recoating", permanent: true },
      ...services.map((s) => ({ source: `/${s}.html`, destination: `/services/${s}`, permanent: true })),
      { source: "/services", destination: "/#services", permanent: false },
      { source: "/images/:name.jpeg", destination: "/images/:name.jpg", permanent: true },
      { source: "/assets/photos/father_and_son_holding_applicator.jpg", destination: "/assets/photos/owner_and_crew_holding_applicator.jpg", permanent: true },
    ];
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
