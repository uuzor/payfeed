import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { streamId } = req.query;
    const updates = req.body;
    
    if (typeof streamId !== 'string') {
      return res.status(400).json({ error: 'Invalid stream ID' });
    }
    
    const stream = await storage.updateStream(streamId, updates);
    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }
    
    res.json({ stream });
  } catch (error) {
    console.error('Update stream error:', error);
    res.status(500).json({ error: 'Failed to update stream' });
  }
}