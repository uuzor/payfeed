import { users, streams, messages, communityStats, type User, type InsertUser, type Stream, type InsertStream, type Message, type InsertMessage, type CommunityStats } from "../../shared/schema";
import { db } from "./database";
import { eq, desc } from "drizzle-orm";

export class DatabaseStorage {
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
    
    return stream;
  }

  async updateStream(id: string, updates: Partial<Stream>): Promise<Stream | undefined> {
    const [stream] = await db
      .update(streams)
      .set(updates)
      .where(eq(streams.id, id))
      .returning();

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
}