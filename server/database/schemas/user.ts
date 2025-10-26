import { relations } from 'drizzle-orm';
import { boolean, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { v7 as uuid } from 'uuid';
import { issue } from './issue';
import { log } from './log';

// User schema definition
export const user = pgTable('user', {
  // Unique ID
  id: varchar('id', { length: 255 }).primaryKey().$default(uuid),
  // Subject ID
  subjectId: varchar('subject_id', { length: 255 }).notNull().unique(),
  // Employee ID
  employeeId: varchar('employee_id', { length: 255 }).notNull().unique(),

  // User name
  name: varchar('name', { length: 255 }).notNull(),
  // User email
  email: varchar('email', { length: 255 }).notNull().unique(),

  // Department
  department: varchar('department', { length: 255 }).notNull(),
  // Position
  position: varchar('position', { length: 255 }).notNull(),

  // Is admin flag
  isAdmin: boolean('is_admin').notNull().default(false),
  // Is super admin flag
  isSuperAdmin: boolean('is_super_admin').notNull().default(false),

  // Created at timestamp
  createdAt: timestamp('created_at').notNull().defaultNow(),
  // Updated at timestamp
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// User relations
export const userRelations = relations(user, ({ many }) => ({
  logs: many(log),
  issues: many(issue),
}));
