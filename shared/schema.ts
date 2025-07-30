import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull().unique(), // Wallet address
  username: text("username"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const streams = pgTable("streams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  communityAddress: text("community_address").notNull(),
  ratePerSecond: decimal("rate_per_second", { precision: 18, scale: 6 }).notNull(), // USDC per second
  totalAmount: decimal("total_amount", { precision: 18, scale: 6 }).notNull(),
  streamedAmount: decimal("streamed_amount", { precision: 18, scale: 6 }).default("0"),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  isActive: boolean("is_active").default(true),
  isPaused: boolean("is_paused").default(false),
  transactionHash: text("transaction_hash"),
  paymentId: text("payment_id"), // BasePay payment ID
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  messageType: text("message_type").default("user"), // user, system, announcement
  metadata: jsonb("metadata"), // For achievements, reactions, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const communityStats = pgTable("community_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  totalMembers: integer("total_members").default(0),
  activeStreamers: integer("active_streamers").default(0),
  totalStreamed: decimal("total_streamed", { precision: 18, scale: 6 }).default("0"),
  monthlyVolume: decimal("monthly_volume", { precision: 18, scale: 6 }).default("0"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStreamSchema = createInsertSchema(streams).omit({
  id: true,
  streamedAmount: true,
  startTime: true,
  isActive: true,
  isPaused: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Stream = typeof streams.$inferSelect;
export type InsertStream = z.infer<typeof insertStreamSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type CommunityStats = typeof communityStats.$inferSelect;
