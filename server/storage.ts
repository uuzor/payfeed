import { users, streams, messages, communityStats, type User, type InsertUser, type Stream, type InsertStream, type Message, type InsertMessage, type CommunityStats } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Streams
  getStream(id: string): Promise<Stream | undefined>;
  getStreamsByUser(userId: string): Promise<Stream[]>;
  getActiveStreams(): Promise<Stream[]>;
  createStream(stream: InsertStream): Promise<Stream>;
  updateStream(id: string, updates: Partial<Stream>): Promise<Stream | undefined>;

  // Messages
  getMessages(limit?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Community Stats
  getCommunityStats(): Promise<CommunityStats>;
  updateCommunityStats(updates: Partial<CommunityStats>): Promise<CommunityStats>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByAddress(address: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.address, address.toLowerCase()));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        address: insertUser.address.toLowerCase(),
      })
      .returning();
    
    // Update community stats
    await this.updateCommunityStatsTotalMembers();
    
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getStream(id: string): Promise<Stream | undefined> {
    const [stream] = await db.select().from(streams).where(eq(streams.id, id));
    return stream || undefined;
  }

  async getStreamsByUser(userId: string): Promise<Stream[]> {
    return await db.select().from(streams).where(eq(streams.userId, userId));
  }

  async getActiveStreams(): Promise<Stream[]> {
    return await db.select().from(streams).where(eq(streams.isActive, true));
  }

  async createStream(insertStream: InsertStream): Promise<Stream> {
    const [stream] = await db
      .insert(streams)
      .values(insertStream)
      .returning();

    // Update community stats
    await this.updateCommunityStatsActiveStreamers();
    
    return stream;
  }

  async updateStream(id: string, updates: Partial<Stream>): Promise<Stream | undefined> {
    const [stream] = await db
      .update(streams)
      .set(updates)
      .where(eq(streams.id, id))
      .returning();

    // Update community stats if needed
    if (updates.streamedAmount || updates.isActive !== undefined || updates.isPaused !== undefined) {
      await this.updateCommunityStatsActiveStreamers();
      await this.updateCommunityStatsTotalStreamed();
    }

    return stream || undefined;
  }

  async getMessages(limit: number = 50): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .orderBy(desc(messages.createdAt))
      .limit(limit);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getCommunityStats(): Promise<CommunityStats> {
    let [stats] = await db.select().from(communityStats).limit(1);
    
    if (!stats) {
      // Create initial stats if none exist
      [stats] = await db
        .insert(communityStats)
        .values({
          totalMembers: 0,
          activeStreamers: 0,
          totalStreamed: "0",
          monthlyVolume: "0",
        })
        .returning();
    }
    
    return stats;
  }

  async updateCommunityStats(updates: Partial<CommunityStats>): Promise<CommunityStats> {
    let [stats] = await db.select().from(communityStats).limit(1);
    
    if (!stats) {
      // Create if doesn't exist
      [stats] = await db
        .insert(communityStats)
        .values({
          totalMembers: 0,
          activeStreamers: 0,
          totalStreamed: "0",
          monthlyVolume: "0",
          ...updates,
        })
        .returning();
    } else {
      [stats] = await db
        .update(communityStats)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(communityStats.id, stats.id))
        .returning();
    }
    
    return stats;
  }

  private async updateCommunityStatsTotalMembers(): Promise<void> {
    const totalUsers = await db.select().from(users);
    await this.updateCommunityStats({ totalMembers: totalUsers.length });
  }

  private async updateCommunityStatsActiveStreamers(): Promise<void> {
    const activeStreams = await this.getActiveStreams();
    const uniqueUsers = new Set(activeStreams.filter(s => !s.isPaused).map(s => s.userId));
    await this.updateCommunityStats({ activeStreamers: uniqueUsers.size });
  }

  private async updateCommunityStatsTotalStreamed(): Promise<void> {
    const allStreams = await db.select().from(streams);
    const totalStreamed = allStreams
      .reduce((sum, s) => sum + parseFloat(s.streamedAmount || "0"), 0);
    await this.updateCommunityStats({ totalStreamed: totalStreamed.toString() });
  }
}

export const storage = new DatabaseStorage();
