import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';
import { insertStreamSchema } from '../../shared/schema';
import { z } from 'zod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
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
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}