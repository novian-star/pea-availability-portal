import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { v7 as uuid } from "uuid";
import { user } from "./user";

export const issueStatus = pgEnum("issue_status", [
	"OPEN",
	"IN_PROGRESS",
	"RESOLVED",
	"CLOSED",
]);

// Issue schema definition
export const issue = pgTable("issue", {
	/// Unique ID
	id: varchar("id", { length: 255 }).primaryKey().$default(uuid),
	/// User ID
	userId: varchar("user_id", { length: 255 }).notNull(),
	/// Title
	title: varchar("title", { length: 255 }).notNull(),
	/// Description
	description: text("description").notNull(),
	/// Contact number
	contactNumber: varchar("contact_number", { length: 255 }).notNull(),
	/// Status
	status: issueStatus("status")
		.notNull()
		.$default(() => "OPEN"),
	/// Status updated at timestamp
	statusUpdatedAt: timestamp("status_updated_at").notNull().defaultNow(),
	/// Created at timestamp
	createdAt: timestamp("created_at").notNull().defaultNow(),
	/// Updated at timestamp
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

// Issue relations
export const issueRelations = relations(issue, ({ one }) => ({
	user: one(user, {
		fields: [issue.userId],
		references: [user.id],
	}),
}));
