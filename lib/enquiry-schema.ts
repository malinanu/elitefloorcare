import { z } from "zod";
import { facilityTypes } from "./facility-types";

export { facilityTypes };

const str = (label: string, max: number) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} is too long`);

export const enquirySchema = z.object({
  name: str("Name", 120),
  business: str("Business / facility", 160),
  phone: str("Phone", 40).regex(/^[+()\d\s-]{6,}$/, "Enter a valid phone number"),
  email: z.string().trim().max(200).pipe(z.email("Enter a valid email address")),
  location: str("Location", 160),
  facilityType: z.enum(facilityTypes, { error: "Choose a facility type" }),
  message: z.string().trim().max(4000, "Message is too long").optional().default(""),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export type { EnquiryState } from "./enquiry-state";
