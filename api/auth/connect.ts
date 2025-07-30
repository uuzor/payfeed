import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DatabaseStorage } from '../../server/storage';

const storage = new DatabaseStorage();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}