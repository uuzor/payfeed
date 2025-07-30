import { type User, type InsertUser, type Stream, type InsertStream, type Message, type InsertMessage, type CommunityStats } from "@shared/schema";
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

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private streams: Map<string, Stream> = new Map();
  private messages: Map<string, Message> = new Map();
  private communityStats: CommunityStats;

  constructor() {
    // Initialize community stats
    this.communityStats = {
      id: randomUUID(),
      totalMembers: 0,
      activeStreamers: 0,
      totalStreamed: "0",
      monthlyVolume: "0",
      updatedAt: new Date(),
    };
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByAddress(address: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.address.toLowerCase() === address.toLowerCase());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    
    // Update community stats
    this.communityStats.totalMembers = this.users.size;
    this.communityStats.updatedAt = new Date();
    
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getStream(id: string): Promise<Stream | undefined> {
    return this.streams.get(id);
  }

  async getStreamsByUser(userId: string): Promise<Stream[]> {
    return Array.from(this.streams.values()).filter(stream => stream.userId === userId);
  }

  async getActiveStreams(): Promise<Stream[]> {
    return Array.from(this.streams.values()).filter(stream => stream.isActive && !stream.isPaused);
  }

  async createStream(insertStream: InsertStream): Promise<Stream> {
    const id = randomUUID();
    const stream: Stream = {
      ...insertStream,
      id,
      streamedAmount: "0",
      startTime: new Date(),
      isActive: true,
      isPaused: false,
    };
    this.streams.set(id, stream);

    // Update community stats
    const activeStreams = await this.getActiveStreams();
    this.communityStats.activeStreamers = activeStreams.length;
    this.communityStats.updatedAt = new Date();

    return stream;
  }

  async updateStream(id: string, updates: Partial<Stream>): Promise<Stream | undefined> {
    const stream = this.streams.get(id);
    if (!stream) return undefined;

    const updatedStream = { ...stream, ...updates };
    this.streams.set(id, updatedStream);

    // Update community stats if needed
    if (updates.streamedAmount) {
      const totalStreamed = Array.from(this.streams.values())
        .reduce((sum, s) => sum + parseFloat(s.streamedAmount || "0"), 0);
      this.communityStats.totalStreamed = totalStreamed.toString();
    }

    const activeStreams = await this.getActiveStreams();
    this.communityStats.activeStreamers = activeStreams.length;
    this.communityStats.updatedAt = new Date();

    return updatedStream;
  }

  async getMessages(limit: number = 50): Promise<Message[]> {
    return Array.from(this.messages.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getCommunityStats(): Promise<CommunityStats> {
    return this.communityStats;
  }

  async updateCommunityStats(updates: Partial<CommunityStats>): Promise<CommunityStats> {
    this.communityStats = { ...this.communityStats, ...updates, updatedAt: new Date() };
    return this.communityStats;
  }
}

export const storage = new MemStorage();
