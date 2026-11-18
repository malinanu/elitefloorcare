"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { Enquiry } from "@/lib/db/schema";
import { headers } from "next/headers";
import { db, schema } from "@/lib/db";
import { enquirySchema, type EnquiryInput, type EnquiryState } from "@/lib/enquiry-schema";
import { clientIp, hashIp, overRateLimit, verifyTurnstile } from "@/lib/guard";
import { sendEnquiryEmail, sendEnquirySms } from "@/lib/notify";

const FIELDS = ["name", "business", "phone", "email", "location", "facilityType", "message"] as const;

const errText = (e: unknown) => (e instanceof Error ? e.message : String(e)).slice(0, 500);

export async function submitEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const values = Object.fromEntries(FIELDS.map((k) => [k, String(formData.get(k) ?? "")])) as Record<keyof EnquiryInput, string>;

  // 1. honeypot: real people never see or fill this field. Pretend success so bots learn nothing.
  if (String(formData.get("company_website") ?? "").trim() !== "") {
    return { status: "success", ref: "ok" };
  }

  // 2. validate
  const parsed = enquirySchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof EnquiryInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as keyof EnquiryInput;
      fieldErrors[k] ??= issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors, values };
  }

  const h = await headers();
  const ip = clientIp(h);
  const ipHash = hashIp(ip);

  try {
    // 3. bot check + rate limit
    if (!(await verifyTurnstile(formData.get("cf-turnstile-response") as string | null, ip))) {
      return { status: "error", message: "We couldn't confirm you're not a bot. Please try again.", values };
    }
    if (await overRateLimit(ipHash)) {
      return { status: "error", message: "Too many requests from your connection. Please call us on 1300 353 667 instead.", values };
    }

    // 4. persist FIRST — a lead is never lost even if email/SMS fail
    //    (MySQL has no RETURNING, so the id and timestamp are set here and the row is rebuilt for the notifications)
    const row: Enquiry = {
      ...parsed.data,
      id: randomUUID(),
      createdAt: new Date(),
      message: parsed.data.message || null,
      ipHash,
      userAgent: h.get("user-agent")?.slice(0, 300) ?? null,
      emailStatus: "pending",
      emailError: null,
      smsStatus: "pending",
      smsError: null,
    };
    await db().insert(schema.enquiries).values(row);

    // 5. notify in parallel; record each outcome on the row
    const [mail, sms] = await Promise.allSettled([sendEnquiryEmail(row), sendEnquirySms(row)]);
    await db()
      .update(schema.enquiries)
      .set({
        emailStatus: mail.status === "fulfilled" ? "sent" : "failed",
        emailError: mail.status === "rejected" ? errText(mail.reason) : null,
        smsStatus: sms.status === "fulfilled" ? sms.value : "failed",
        smsError: sms.status === "rejected" ? errText(sms.reason) : null,
      })
      .where(eq(schema.enquiries.id, row.id));
    if (mail.status === "rejected") console.error(`[enquiry ${row.id}] email failed:`, mail.reason);
    if (sms.status === "rejected") console.error(`[enquiry ${row.id}] sms failed:`, sms.reason);

    // 6. the enquiry is stored, so the visitor sees success either way
    return { status: "success", ref: row.id.slice(0, 8).toUpperCase() };
  } catch (err) {
    console.error("[enquiry] could not be saved", err);
    return { status: "error", message: "Something went wrong on our side. Please call us on 1300 353 667 or try again shortly.", values };
  }
}
