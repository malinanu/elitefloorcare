import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/lib/env";
import type { Enquiry } from "@/payload-types";

let transporter: Transporter | undefined;
function mailer() {
  const e = env();
  transporter ??= nodemailer.createTransport({
    host: e.SMTP_HOST!,
    port: e.SMTP_PORT,
    secure: e.SMTP_SECURE,
    auth: e.SMTP_USER ? { user: e.SMTP_USER, pass: e.SMTP_PASS } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return transporter;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const melbourne = (d: Date) =>
  new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short", timeZone: "Australia/Melbourne" }).format(d);

export async function sendEnquiryEmail(q: Enquiry): Promise<"sent" | "skipped"> {
  const e = env();
  if (!e.SMTP_HOST || !e.ENQUIRY_EMAIL_TO) return "skipped";
  const rows: [string, string][] = [
    ["Name", q.name],
    ["Business / facility", q.business],
    ["Phone", q.phone],
    ["Email", q.email],
    ["Location", q.location],
    ["Facility type", q.facilityType],
    ["Message", q.message || "—"],
    ["Received", melbourne(new Date(q.createdAt))],
    ["Reference", String(q.id)],
  ];
  const text = `New free-inspection request\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n`;
  const html = `<h2 style="font-family:Arial,sans-serif;color:#061A3D">New free-inspection request</h2>
<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">
${rows.map(([k, v]) => `<tr><td style="color:#5C7592;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="color:#061A3D">${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("\n")}
</table>`;

  await mailer().sendMail({
    from: e.MAIL_FROM,
    to: e.ENQUIRY_EMAIL_TO,
    replyTo: { name: q.name, address: q.email },
    subject: `Inspection request: ${q.business} (${q.location})`,
    text,
    html,
  });
  return "sent";
}

/** Swappable SMS provider. ClickSend is Australian and sends to AU mobiles without a local number. */
export async function sendEnquirySms(q: Enquiry): Promise<"sent" | "skipped"> {
  const e = env();
  const body = `New inspection request: ${q.name}, ${q.business} (${q.location}). Ph ${q.phone}`.slice(0, 300);

  switch (e.SMS_PROVIDER) {
    case "none":
      return "skipped";
    case "console":
      console.info(`[sms:console] to=${e.SMS_TO ?? "(unset)"} body=${body}`);
      return "sent";
    case "clicksend": {
      const auth = Buffer.from(`${e.CLICKSEND_USERNAME}:${e.CLICKSEND_API_KEY}`).toString("base64");
      const res = await fetch("https://rest.clicksend.com/v3/sms/send", {
        method: "POST",
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ source: "website", to: e.SMS_TO, body, ...(e.SMS_FROM ? { from: e.SMS_FROM } : {}) }] }),
        signal: AbortSignal.timeout(10_000),
      });
      const json = (await res.json().catch(() => null)) as { response_code?: string; data?: { messages?: { status?: string }[] } } | null;
      const status = json?.data?.messages?.[0]?.status;
      if (!res.ok || json?.response_code !== "SUCCESS" || (status && status !== "SUCCESS")) {
        throw new Error(`ClickSend ${res.status}: ${json?.response_code ?? "no response"} / ${status ?? "?"}`);
      }
      return "sent";
    }
  }
}
