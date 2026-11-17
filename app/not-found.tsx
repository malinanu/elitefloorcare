import Link from "next/link";
import { CtaBand, PlainHero } from "@/components/inner";

export default function NotFound() {
  return (
    <main className="pg">
      <PlainHero
        title="Page not found"
        lead="That page has moved or never existed. Try the services menu above, or head back to the homepage."
        crumbs={[{ href: "/", label: "Home" }, { label: "Not found" }]}
      />
      <section className="ps ps-white">
        <div className="pg-wrap">
          <Link href="/" className="efc-outline-dark pg-btn">
            Back to the homepage
          </Link>
        </div>
      </section>
      <CtaBand title="Ready to protect your floor?" text="Free inspection, written report, costed recommendation. No obligation and no sales pitch." />
    </main>
  );
}
