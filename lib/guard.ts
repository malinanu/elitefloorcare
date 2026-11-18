import "server-only";
import { createHash } from "node:crypto";
import { env } from "@/lib/env";
import { cms } from "@/lib/cms";

/** Client IP from the reverse proxy chain (Cloudflare first, then the first X-Forwarded-For hop). */
export function clientIp(h: Headers): string {
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "0.0.0.0";
}

/** We never store raw IPs — only a salted hash, enough to rate-limit. */
export function hashIp(ip: string) {
  return createHash("sha256").update(`${env().IP_HASH_SALT}:${ip}`).digest("hex");
}

/** Rate limit backed by the enquiries collection itself, so it survives restarts. */
export async function overRateLimit(ipHash: string) {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { totalDocs } = await (await cms()).count({
    collection: "enquiries",
    where: { and: [{ ipHash: { equals: ipHash } }, { createdAt: { greater_than: since } }] },
  });
  return totalDocs >= env().RATE_LIMIT_PER_HOUR;
}

/** Cloudflare Turnstile server-side check. Skipped (returns true) when no secret is configured. */
export async function verifyTurnstile(token: string | null, ip: string) {
  const secret = env().TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(8_000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("[turnstile] verification request failed", err);
    return false;
  }
}
