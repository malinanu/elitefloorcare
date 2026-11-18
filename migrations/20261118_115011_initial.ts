import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`services_involves_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_involves_items_order_idx\` ON \`services_involves_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`services_involves_items_parent_id_idx\` ON \`services_involves_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`services_depth_legend\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_depth_legend_order_idx\` ON \`services_depth_legend\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`services_depth_legend_parent_id_idx\` ON \`services_depth_legend\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`services_steps_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`text\` text NOT NULL,
  	\`accent\` integer,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_steps_items_order_idx\` ON \`services_steps_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`services_steps_items_parent_id_idx\` ON \`services_steps_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`services_before_after_pairs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`before_id\` integer NOT NULL,
  	\`after_id\` integer NOT NULL,
  	\`before_label\` text DEFAULT 'Before',
  	\`after_label\` text DEFAULT 'After',
  	\`caption\` text,
  	FOREIGN KEY (\`before_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`after_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_before_after_pairs_order_idx\` ON \`services_before_after_pairs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`services_before_after_pairs_parent_id_idx\` ON \`services_before_after_pairs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`services_before_after_pairs_before_idx\` ON \`services_before_after_pairs\` (\`before_id\`);`)
  await db.run(sql`CREATE INDEX \`services_before_after_pairs_after_idx\` ON \`services_before_after_pairs\` (\`after_id\`);`)
  await db.run(sql`CREATE TABLE \`services\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`order\` numeric DEFAULT 0,
  	\`nav_label\` text NOT NULL,
  	\`footer_label\` text NOT NULL,
  	\`icon\` text NOT NULL,
  	\`hero_image_id\` integer NOT NULL,
  	\`lead\` text NOT NULL,
  	\`crumb\` text NOT NULL,
  	\`summary\` text NOT NULL,
  	\`cross_sell_tagline\` text NOT NULL,
  	\`involves_eyebrow\` text NOT NULL,
  	\`involves_title\` text NOT NULL,
  	\`involves_body\` text NOT NULL,
  	\`involves_card_title\` text NOT NULL,
  	\`involves_note\` text,
  	\`depth_enabled\` integer DEFAULT false,
  	\`depth_fig_label\` text,
  	\`depth_eyebrow\` text,
  	\`depth_title\` text,
  	\`depth_body\` text,
  	\`depth_fallback_image_id\` integer,
  	\`steps_eyebrow\` text NOT NULL,
  	\`steps_title\` text NOT NULL,
  	\`audience_title\` text NOT NULL,
  	\`before_after_eyebrow\` text NOT NULL,
  	\`before_after_title\` text NOT NULL,
  	\`before_after_button_label\` text DEFAULT 'Full gallery',
  	\`cross_sell_eyebrow\` text DEFAULT 'Also from us',
  	\`cta_title\` text DEFAULT 'Ready to protect your floor?',
  	\`cta_text\` text DEFAULT 'Free inspection, written report, costed recommendation. No obligation and no sales pitch.',
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`depth_fallback_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`services_slug_idx\` ON \`services\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`services_hero_image_idx\` ON \`services\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`services_depth_depth_fallback_image_idx\` ON \`services\` (\`depth_fallback_image_id\`);`)
  await db.run(sql`CREATE INDEX \`services_updated_at_idx\` ON \`services\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`services_created_at_idx\` ON \`services\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`projects\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`sector\` text NOT NULL,
  	\`work\` text NOT NULL,
  	\`before_id\` integer NOT NULL,
  	\`after_id\` integer NOT NULL,
  	\`order\` numeric DEFAULT 0,
  	\`published\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`before_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`after_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_before_idx\` ON \`projects\` (\`before_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_after_idx\` ON \`projects\` (\`after_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_updated_at_idx\` ON \`projects\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`projects_created_at_idx\` ON \`projects\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`testimonials\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`quote\` text NOT NULL,
  	\`person\` text NOT NULL,
  	\`organisation\` text NOT NULL,
  	\`order\` numeric DEFAULT 0,
  	\`published\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`testimonials_updated_at_idx\` ON \`testimonials\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_created_at_idx\` ON \`testimonials\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`plans_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`plans\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`plans_items_order_idx\` ON \`plans_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`plans_items_parent_id_idx\` ON \`plans_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`plans\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`price\` text NOT NULL,
  	\`term\` text NOT NULL,
  	\`colour\` text DEFAULT 'blue',
  	\`description\` text NOT NULL,
  	\`featured\` integer,
  	\`ribbon\` text DEFAULT 'Best value',
  	\`order\` numeric DEFAULT 0,
  	\`published\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`plans_updated_at_idx\` ON \`plans\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`plans_created_at_idx\` ON \`plans\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumbnail_url\` text,
  	\`sizes_thumbnail_width\` numeric,
  	\`sizes_thumbnail_height\` numeric,
  	\`sizes_thumbnail_mime_type\` text,
  	\`sizes_thumbnail_filesize\` numeric,
  	\`sizes_thumbnail_filename\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumbnail_sizes_thumbnail_filename_idx\` ON \`media\` (\`sizes_thumbnail_filename\`);`)
  await db.run(sql`CREATE TABLE \`enquiries\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`business\` text NOT NULL,
  	\`phone\` text NOT NULL,
  	\`email\` text NOT NULL,
  	\`location\` text NOT NULL,
  	\`facility_type\` text NOT NULL,
  	\`message\` text,
  	\`status\` text DEFAULT 'new',
  	\`notes\` text,
  	\`email_status\` text DEFAULT 'pending',
  	\`email_error\` text,
  	\`sms_status\` text DEFAULT 'pending',
  	\`sms_error\` text,
  	\`ip_hash\` text,
  	\`user_agent\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`enquiries_ip_hash_idx\` ON \`enquiries\` (\`ip_hash\`);`)
  await db.run(sql`CREATE INDEX \`enquiries_updated_at_idx\` ON \`enquiries\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`enquiries_created_at_idx\` ON \`enquiries\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`reset_password_requested_at\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`services_id\` integer,
  	\`projects_id\` integer,
  	\`testimonials_id\` integer,
  	\`plans_id\` integer,
  	\`media_id\` integer,
  	\`enquiries_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`services_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`testimonials_id\`) REFERENCES \`testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`plans_id\`) REFERENCES \`plans\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`enquiries_id\`) REFERENCES \`enquiries\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_services_id_idx\` ON \`payload_locked_documents_rels\` (\`services_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_projects_id_idx\` ON \`payload_locked_documents_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_testimonials_id_idx\` ON \`payload_locked_documents_rels\` (\`testimonials_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_plans_id_idx\` ON \`payload_locked_documents_rels\` (\`plans_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_enquiries_id_idx\` ON \`payload_locked_documents_rels\` (\`enquiries_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_sectors\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_sectors_order_idx\` ON \`site_settings_sectors\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_sectors_parent_id_idx\` ON \`site_settings_sectors\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`legal_name\` text NOT NULL,
  	\`phone\` text NOT NULL,
  	\`email\` text NOT NULL,
  	\`street\` text NOT NULL,
  	\`locality\` text NOT NULL,
  	\`region\` text NOT NULL,
  	\`postcode\` text NOT NULL,
  	\`abn\` text NOT NULL,
  	\`tagline\` text NOT NULL,
  	\`footer_note\` text NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`home_floats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`text\` text NOT NULL,
  	\`icon\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_floats_order_idx\` ON \`home_floats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_floats_parent_id_idx\` ON \`home_floats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text NOT NULL,
  	\`label\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_stats_order_idx\` ON \`home_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_stats_parent_id_idx\` ON \`home_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_benefits\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`icon\` text NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_benefits_order_idx\` ON \`home_benefits\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_benefits_parent_id_idx\` ON \`home_benefits\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_pairs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`before_id\` integer NOT NULL,
  	\`after_id\` integer NOT NULL,
  	\`caption\` text NOT NULL,
  	FOREIGN KEY (\`before_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`after_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_pairs_order_idx\` ON \`home_pairs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_pairs_parent_id_idx\` ON \`home_pairs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_pairs_before_idx\` ON \`home_pairs\` (\`before_id\`);`)
  await db.run(sql`CREATE INDEX \`home_pairs_after_idx\` ON \`home_pairs\` (\`after_id\`);`)
  await db.run(sql`CREATE TABLE \`home_contact_ticks\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_contact_ticks_order_idx\` ON \`home_contact_ticks\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_contact_ticks_parent_id_idx\` ON \`home_contact_ticks\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_eyebrow\` text NOT NULL,
  	\`hero_title\` text NOT NULL,
  	\`hero_highlight\` text NOT NULL,
  	\`hero_lead\` text NOT NULL,
  	\`hero_image_id\` integer NOT NULL,
  	\`why_eyebrow\` text NOT NULL,
  	\`why_title\` text NOT NULL,
  	\`why_lead\` text NOT NULL,
  	\`why_image_id\` integer NOT NULL,
  	\`why_note\` text NOT NULL,
  	\`services_eyebrow\` text NOT NULL,
  	\`services_title\` text NOT NULL,
  	\`services_intro\` text NOT NULL,
  	\`plans_eyebrow\` text NOT NULL,
  	\`plans_title\` text NOT NULL,
  	\`plans_lead\` text NOT NULL,
  	\`plans_fine\` text NOT NULL,
  	\`gallery_eyebrow\` text NOT NULL,
  	\`gallery_title\` text NOT NULL,
  	\`gallery_button\` text NOT NULL,
  	\`testimonials_eyebrow\` text NOT NULL,
  	\`contact_eyebrow\` text NOT NULL,
  	\`contact_title\` text NOT NULL,
  	\`contact_lead\` text NOT NULL,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`why_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`home_hero_image_idx\` ON \`home\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_why_image_idx\` ON \`home\` (\`why_image_id\`);`)
  await db.run(sql`CREATE TABLE \`about_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text NOT NULL,
  	\`label\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_stats_order_idx\` ON \`about_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_stats_parent_id_idx\` ON \`about_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_saw\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_saw_order_idx\` ON \`about_saw\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_saw_parent_id_idx\` ON \`about_saw\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`icon\` text NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_cards_order_idx\` ON \`about_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_cards_parent_id_idx\` ON \`about_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_accreditations\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`kind\` text NOT NULL,
  	\`title\` text NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_accreditations_order_idx\` ON \`about_accreditations\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_accreditations_parent_id_idx\` ON \`about_accreditations\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_crew\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_crew_order_idx\` ON \`about_crew\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_crew_parent_id_idx\` ON \`about_crew\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_crew_image_idx\` ON \`about_crew\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`about\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_title\` text NOT NULL,
  	\`hero_highlight\` text NOT NULL,
  	\`hero_lead\` text NOT NULL,
  	\`hero_image_id\` integer NOT NULL,
  	\`story_image_id\` integer NOT NULL,
  	\`badge_title\` text NOT NULL,
  	\`badge_text\` text NOT NULL,
  	\`story_eyebrow\` text NOT NULL,
  	\`story_title\` text NOT NULL,
  	\`story_lead\` text NOT NULL,
  	\`saw_label\` text NOT NULL,
  	\`story_text\` text NOT NULL,
  	\`quote_title\` text NOT NULL,
  	\`quote_text\` text NOT NULL,
  	\`why_eyebrow\` text NOT NULL,
  	\`why_title\` text NOT NULL,
  	\`accr_eyebrow\` text NOT NULL,
  	\`accr_title\` text NOT NULL,
  	\`accr_text\` text NOT NULL,
  	\`crew_eyebrow\` text NOT NULL,
  	\`crew_title\` text NOT NULL,
  	\`cta_title\` text NOT NULL,
  	\`cta_text\` text NOT NULL,
  	\`meta_description\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`story_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`about_hero_image_idx\` ON \`about\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`about_story_image_idx\` ON \`about\` (\`story_image_id\`);`)
  await db.run(sql`CREATE TABLE \`gallery_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`lead\` text NOT NULL,
  	\`cta_title\` text NOT NULL,
  	\`cta_text\` text NOT NULL,
  	\`meta_description\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`service_areas_page_coverage_ticks\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_areas_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`service_areas_page_coverage_ticks_order_idx\` ON \`service_areas_page_coverage_ticks\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`service_areas_page_coverage_ticks_parent_id_idx\` ON \`service_areas_page_coverage_ticks\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`service_areas_page_times\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`kind\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_areas_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`service_areas_page_times_order_idx\` ON \`service_areas_page_times\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`service_areas_page_times_parent_id_idx\` ON \`service_areas_page_times\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`service_areas_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`lead\` text NOT NULL,
  	\`coverage_eyebrow\` text NOT NULL,
  	\`coverage_title\` text NOT NULL,
  	\`coverage_text\` text NOT NULL,
  	\`times_eyebrow\` text NOT NULL,
  	\`times_title\` text NOT NULL,
  	\`cta_title\` text NOT NULL,
  	\`cta_text\` text NOT NULL,
  	\`meta_description\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`services_involves_items\`;`)
  await db.run(sql`DROP TABLE \`services_depth_legend\`;`)
  await db.run(sql`DROP TABLE \`services_steps_items\`;`)
  await db.run(sql`DROP TABLE \`services_before_after_pairs\`;`)
  await db.run(sql`DROP TABLE \`services\`;`)
  await db.run(sql`DROP TABLE \`projects\`;`)
  await db.run(sql`DROP TABLE \`testimonials\`;`)
  await db.run(sql`DROP TABLE \`plans_items\`;`)
  await db.run(sql`DROP TABLE \`plans\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`enquiries\`;`)
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`site_settings_sectors\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`home_floats\`;`)
  await db.run(sql`DROP TABLE \`home_stats\`;`)
  await db.run(sql`DROP TABLE \`home_benefits\`;`)
  await db.run(sql`DROP TABLE \`home_pairs\`;`)
  await db.run(sql`DROP TABLE \`home_contact_ticks\`;`)
  await db.run(sql`DROP TABLE \`home\`;`)
  await db.run(sql`DROP TABLE \`about_stats\`;`)
  await db.run(sql`DROP TABLE \`about_saw\`;`)
  await db.run(sql`DROP TABLE \`about_cards\`;`)
  await db.run(sql`DROP TABLE \`about_accreditations\`;`)
  await db.run(sql`DROP TABLE \`about_crew\`;`)
  await db.run(sql`DROP TABLE \`about\`;`)
  await db.run(sql`DROP TABLE \`gallery_page\`;`)
  await db.run(sql`DROP TABLE \`service_areas_page_coverage_ticks\`;`)
  await db.run(sql`DROP TABLE \`service_areas_page_times\`;`)
  await db.run(sql`DROP TABLE \`service_areas_page\`;`)
}
