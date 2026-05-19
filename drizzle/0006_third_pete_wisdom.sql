CREATE TABLE "mcp_landscape_mcps" (
	"id" serial PRIMARY KEY NOT NULL,
	"tool_id" integer NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"name_zh" text,
	"extension_id" text,
	"in_dev" boolean DEFAULT false NOT NULL,
	"deps_count" integer DEFAULT 0 NOT NULL,
	"blurb" text NOT NULL,
	"blurb_zh" text NOT NULL,
	"tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mcp_landscape_mcps_slug_unique" UNIQUE("slug"),
	CONSTRAINT "mcp_mcps_status_xor" CHECK (NOT ("extension_id" IS NOT NULL AND "in_dev" = true))
);
--> statement-breakpoint
ALTER TABLE "mcp_landscape_tools" DROP CONSTRAINT "mcp_tools_status_xor";--> statement-breakpoint
ALTER TABLE "mcp_landscape_tools" DROP CONSTRAINT "mcp_landscape_tools_extension_id_extensions_id_fk";
--> statement-breakpoint
DROP INDEX "idx_mcp_tools_extension";--> statement-breakpoint
ALTER TABLE "mcp_landscape_mcps" ADD CONSTRAINT "mcp_landscape_mcps_tool_id_mcp_landscape_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."mcp_landscape_tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mcp_landscape_mcps" ADD CONSTRAINT "mcp_landscape_mcps_extension_id_extensions_id_fk" FOREIGN KEY ("extension_id") REFERENCES "public"."extensions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_mcp_mcps_tool_sort" ON "mcp_landscape_mcps" USING btree ("tool_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_mcp_mcps_extension" ON "mcp_landscape_mcps" USING btree ("extension_id");--> statement-breakpoint
ALTER TABLE "mcp_landscape_tools" DROP COLUMN "extension_id";--> statement-breakpoint
ALTER TABLE "mcp_landscape_tools" DROP COLUMN "in_dev";--> statement-breakpoint
ALTER TABLE "mcp_landscape_tools" DROP COLUMN "deps_count";--> statement-breakpoint
ALTER TABLE "mcp_landscape_tools" DROP COLUMN "tags";