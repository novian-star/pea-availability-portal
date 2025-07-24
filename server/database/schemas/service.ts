import {
	integer,
	pgTable,
	text,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';
import { v7 as uuid } from 'uuid';

// Service schema definition
export const service = pgTable('service', {
	// Unique ID
	id: varchar('id', { length: 255 }).primaryKey().$default(uuid),

	// Service name
	name: varchar('name', { length: 255 }).notNull(),
	// Service description
	description: text('description'),

	// Service URL
	url: text('url').notNull(),
	// Service URL type (e.g., 'external', 'embedded')
	urlType: text('url_type', { enum: ['external', 'embedded'] }).notNull(),

	// Order index
	orderIndex: integer('order_index').notNull().default(0),

	// Created at timestamp
	createdAt: timestamp('created_at').notNull().defaultNow(),
	// Updated at timestamp
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	// Deleted at timestamp
	deletedAt: timestamp('deleted_at'),
});
