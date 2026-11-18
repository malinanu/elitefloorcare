import { notFound } from "next/navigation";

// With two root layouts (site + Payload admin) Next has no global 404 boundary,
// so unknown site URLs are routed here and rendered by (site)/not-found.tsx.
export default function Missing() {
  notFound();
}
