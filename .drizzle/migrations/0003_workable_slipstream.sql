CREATE TABLE "notice" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255),
	"content" text,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
