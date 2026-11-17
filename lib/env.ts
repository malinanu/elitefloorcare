import "server-only";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),

  // email (any SMTP provider: Resend SMTP, Zoho, Microsoft 365, the client's mail host…)
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().min(3), // e.g. "Elite Sports Floor Care <no-reply@elitesportsfloorcare.com.au>"
  ENQUIRY_EMAIL_TO: z.string().min(3), // comma-separated list allowed

  // SMS alert to the owner
  SMS_PROVIDER: z.enum(["clicksend", "console", "none"]).default("none"),
  SMS_TO: z.string().optional(), // E.164, e.g. +614xxxxxxxx
  SMS_FROM: z.string().optional(), // optional alpha sender ID (max 11 chars) or dedicated number
  CLICKSEND_USERNAME: z.string().optional(),
  CLICKSEND_API_KEY: z.string().optional(),

  // spam protection
  TURNSTILE_SECRET_KEY: z.string().optional(),
  IP_HASH_SALT: z.string().min(16),
  RATE_LIMIT_PER_HOUR: z.coerce.number().int().positive().default(5),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

/** Validated server env. Throws a readable error listing every missing/invalid variable. */
export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid server environment:\n${issues}`);
  }
  const e = parsed.data;
  if (e.SMS_PROVIDER === "clicksend" && (!e.CLICKSEND_USERNAME || !e.CLICKSEND_API_KEY || !e.SMS_TO)) {
    throw new Error("SMS_PROVIDER=clicksend needs CLICKSEND_USERNAME, CLICKSEND_API_KEY and SMS_TO");
  }
  if (e.NODE_ENV === "production" && !e.TURNSTILE_SECRET_KEY) {
    console.warn("[env] TURNSTILE_SECRET_KEY is not set — the enquiry form has no bot check beyond the honeypot and rate limit.");
  }
  cached = e;
  return e;
}
