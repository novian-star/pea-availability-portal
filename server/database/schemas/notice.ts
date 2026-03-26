import {
  boolean,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { v7 as uuid } from 'uuid';

// Notice schema definition
export const notice = pgTable('notice', {
  // Unique ID
  id: varchar('id', { length: 255 }).primaryKey().$default(uuid),

  // Notice title
  title: varchar('title', { length: 255 }),

  // Notice content
  content: text('content'),

  // Whether the notice is enabled/active
  isEnabled: boolean('is_enabled').notNull().default(false),

  // Whether to show the notice in the top banner
  showInBanner: boolean('show_in_banner').notNull().default(false),

  // Updated at timestamp (used to track notice changes for sessionStorage)
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
