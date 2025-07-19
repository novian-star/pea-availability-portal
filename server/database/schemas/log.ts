import { relations } from 'drizzle-orm';
import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { v7 as uuid } from 'uuid';
import { user } from './user';

// Log schema definition
export const log = pgTable('log', {
  // Unique ID
  id: varchar('id', { length: 255 }).primaryKey().$default(uuid),
  // User ID
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => user.id, {
      onUpdate: 'cascade',
      onDelete: 'cascade',
    }),

  // Action performed
  action: varchar('action', { length: 255 }).notNull(),
  // Timestamp
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});

// Log relations
export const logRelations = relations(log, ({ one }) => ({
  user: one(user, {
    fields: [log.userId],
    references: [user.id],
  }),
}));
