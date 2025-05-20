import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  avatarInitial: text("avatar_initial").notNull(),
  avatarColor: text("avatar_color").notNull(),
  status: text("status").notNull().default("offline"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Groups table
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Group members table (many-to-many)
export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id),
  userId: integer("user_id").notNull().references(() => users.id),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content"),
  codeSnippets: jsonb("code_snippets"), // Array of code snippets
  senderId: integer("sender_id").notNull().references(() => users.id),
  recipientId: integer("recipient_id").references(() => users.id),
  groupId: integer("group_id").references(() => groups.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  avatarInitial: true,
  avatarColor: true,
  status: true,
});

export const insertGroupSchema = createInsertSchema(groups).pick({
  name: true,
  icon: true,
  color: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).pick({
  groupId: true,
  userId: true,
  isAdmin: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  codeSnippets: true,
  senderId: true,
  recipientId: true,
  groupId: true,
});

// Code snippet schema
export const codeSnippetSchema = z.object({
  language: z.string(),
  code: z.string(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type CodeSnippet = z.infer<typeof codeSnippetSchema>;

export type User = typeof users.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type GroupMember = typeof groupMembers.$inferSelect;
export type Message = typeof messages.$inferSelect;
