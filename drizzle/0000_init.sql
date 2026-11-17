CREATE TABLE "enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"business" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"location" text NOT NULL,
	"facility_type" text NOT NULL,
	"message" text,
	"ip_hash" text NOT NULL,
	"user_agent" text,
	"email_status" text DEFAULT 'pending' NOT NULL,
	"email_error" text,
	"sms_status" text DEFAULT 'pending' NOT NULL,
	"sms_error" text
);
--> statement-breakpoint
CREATE INDEX "enquiries_ip_created_idx" ON "enquiries" USING btree ("ip_hash","created_at");--> statement-breakpoint
CREATE INDEX "enquiries_created_idx" ON "enquiries" USING btree ("created_at");