import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DatabaseStorage } from '../../server/storage';

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
    const hasActiveStream = streams.some(stream => stream.isActive && !stream.isPaused);
    
    res.json({ 
      hasAccess: hasActiveStream, 
      activeStreams: streams.filter(s => s.isActive && !s.isPaused) 
    });
  } catch (error) {
    console.error('Verify access error:', error);
    res.status(500).json({ error: 'Failed to verify access' });
  }
}