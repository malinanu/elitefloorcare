import { sql } from "drizzle-orm";
import { index, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const enquiries = mysqlTable(
  "enquiries",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    createdAt: timestamp("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    name: varchar("name", { length: 120 }).notNull(),
    business: varchar("business", { length: 160 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    email: varchar("email", { length: 200 }).notNull(),
    location: varchar("location", { length: 160 }).notNull(),
    facilityType: varchar("facility_type", { length: 40 }).notNull(),
    message: text("message"),
    ipHash: varchar("ip_hash", { length: 64 }).notNull(),
    userAgent: varchar("user_agent", { length: 300 }),
    /** pending | sent | failed | skipped */
    emailStatus: varchar("email_status", { length: 16 }).notNull().default("pending"),
    emailError: text("email_error"),
    smsStatus: varchar("sms_status", { length: 16 }).notNull().default("pending"),
    smsError: text("sms_error"),
  },
  (t) => [index("enquiries_ip_created_idx").on(t.ipHash, t.createdAt), index("enquiries_created_idx").on(t.createdAt)],
);

export type Enquiry = typeof enquiries.$inferSelect;
export type NewEnquiry = typeof enquiries.$inferInsert;
