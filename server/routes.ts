import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertStreamSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const connectedClients = new Map<string, WebSocket>();

  wss.on('connection', (ws: WebSocket, request) => {
    const userId = request.url?.split('userId=')[1];
    if (userId) {
      connectedClients.set(userId, ws);
    }

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'sendMessage') {
          const newMessage = await storage.createMessage({
            userId: message.userId,
            content: message.content,
            messageType: 'user',
          });

          // Broadcast to all connected clients
          const messageWithUser = {
            ...newMessage,
            user: await storage.getUser(message.userId)
          };

          connectedClients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'newMessage',
                message: messageWithUser
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        connectedClients.delete(userId);
      }
    });
  });

  // Auth routes
  app.post('/api/auth/connect', async (req, res) => {
    try {
      const { address, signature, message } = req.body;
      
      if (!address || !signature || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // In a real app, verify the signature here
      // For now, we'll trust the frontend verification
      
      let user = await storage.getUserByAddress(address);
      if (!user) {
        user = await storage.createUser({
          address,
          username: `${address.slice(0, 6)}...${address.slice(-4)}`,
          isVerified: false,
        });
      }

      res.json({ user });
    } catch (error) {
      console.error('Auth error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });

  // Stream routes
  app.post('/api/streams', async (req, res) => {
    try {
      const streamData = insertStreamSchema.parse(req.body);
      const stream = await storage.createStream(streamData);
      res.json({ stream });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid stream data', details: error.errors });
      }
      console.error('Create stream error:', error);
      res.status(500).json({ error: 'Failed to create stream' });
    }
  });

  app.get('/api/streams/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const streams = await storage.getStreamsByUser(userId);
      res.json({ streams });
    } catch (error) {
      console.error('Get user streams error:', error);
      res.status(500).json({ error: 'Failed to get streams' });
    }
  });

  app.patch('/api/streams/:streamId', async (req, res) => {
    try {
      const { streamId } = req.params;
      const updates = req.body;
      
      const stream = await storage.updateStream(streamId, updates);
      if (!stream) {
        return res.status(404).json({ error: 'Stream not found' });
      }
      
      res.json({ stream });
    } catch (error) {
      console.error('Update stream error:', error);
      res.status(500).json({ error: 'Failed to update stream' });
    }
  });

  // Message routes
  app.get('/api/messages', async (req, res) => {
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
  });

  // Community stats
  app.get('/api/community/stats', async (req, res) => {
    try {
      const stats = await storage.getCommunityStats();
      res.json({ stats });
    } catch (error) {
      console.error('Get community stats error:', error);
      res.status(500).json({ error: 'Failed to get community stats' });
    }
  });

  // Verify stream access (proof-of-pay)
  app.get('/api/verify-access/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const streams = await storage.getStreamsByUser(userId);
      const hasActiveStream = streams.some(stream => stream.isActive && !stream.isPaused);
      
      res.json({ hasAccess: hasActiveStream, activeStreams: streams.filter(s => s.isActive && !s.isPaused) });
    } catch (error) {
      console.error('Verify access error:', error);
      res.status(500).json({ error: 'Failed to verify access' });
    }
  });

  return httpServer;
}
