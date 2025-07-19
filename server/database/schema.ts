import { pgTable, serial, text } from 'drizzle-orm/pg-core';

/**
 * @deprecated
 */
export const service = pgTable('service', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  url: text('url').notNull(),
});
