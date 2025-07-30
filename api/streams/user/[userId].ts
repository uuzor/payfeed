import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DatabaseStorage } from '../../_lib/storage';

const storage = new DatabaseStorage();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    
    if (typeof userId !== 'string') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const streams = await storage.getStreamsByUser(userId);
    res.json({ streams });
  } catch (error) {
    console.error('Get user streams error:', error);
    res.status(500).json({ error: 'Failed to get streams' });
  }
}