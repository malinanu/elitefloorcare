import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const enquiries = pgTable(
  "enquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    name: text("name").notNull(),
    business: text("business").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    location: text("location").notNull(),
    facilityType: text("facility_type").notNull(),
    message: text("message"),
    ipHash: text("ip_hash").notNull(),
    userAgent: text("user_agent"),
    /** pending | sent | failed | skipped */
    emailStatus: text("email_status").notNull().default("pending"),
    emailError: text("email_error"),
    smsStatus: text("sms_status").notNull().default("pending"),
    smsError: text("sms_error"),
  },
  (t) => [index("enquiries_ip_created_idx").on(t.ipHash, t.createdAt), index("enquiries_created_idx").on(t.createdAt)],
);

export type Enquiry = typeof enquiries.$inferSelect;
export type NewEnquiry = typeof enquiries.$inferInsert;
