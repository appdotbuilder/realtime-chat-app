
import { serial, text, pgTable, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const messagesTable = pgTable('messages', {
  id: serial('id').primaryKey(),
  sender_id: integer('sender_id').notNull().references(() => usersTable.id),
  receiver_id: integer('receiver_id').notNull().references(() => usersTable.id),
  content: text('content').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Relations for easier querying
export const usersRelations = relations(usersTable, ({ many }) => ({
  sentMessages: many(messagesTable, { relationName: 'sender' }),
  receivedMessages: many(messagesTable, { relationName: 'receiver' }),
}));

export const messagesRelations = relations(messagesTable, ({ one }) => ({
  sender: one(usersTable, {
    fields: [messagesTable.sender_id],
    references: [usersTable.id],
    relationName: 'sender',
  }),
  receiver: one(usersTable, {
    fields: [messagesTable.receiver_id],
    references: [usersTable.id],
    relationName: 'receiver',
  }),
}));

// TypeScript types for the table schemas
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Message = typeof messagesTable.$inferSelect;
export type NewMessage = typeof messagesTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = { 
  users: usersTable, 
  messages: messagesTable 
};
