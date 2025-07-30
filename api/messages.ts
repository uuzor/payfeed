import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DatabaseStorage } from './_lib/storage';
import { insertMessageSchema } from '../shared/schema';
import { z } from 'zod';

const storage = new DatabaseStorage();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const messages = await storage.getMessages(limit);
      
      // Fetch user data for each message
      const messagesWithUsers = await Promise.all(
        messages.map(async (message) => ({
          ...message,
          user: await storage.getUser(message.userId)
        }))
      );
      
      res.json({ messages: messagesWithUsers });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  } else if (req.method === 'POST') {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      
      // Get user data for the response
      const user = await storage.getUser(message.userId);
      const messageWithUser = { ...message, user };
      
      res.json({ message: messageWithUser });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid message data', details: error.errors });
      }
      console.error('Create message error:', error);
      res.status(500).json({ error: 'Failed to create message' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}