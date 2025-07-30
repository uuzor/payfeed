import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PollingMessage {
  id: string;
  userId: string;
  content: string;
  messageType: string;
  createdAt: Date;
  user?: {
    id: string;
    address: string;
    username?: string;
  };
}

export function usePollingMessages(userId?: string, hasAccess?: boolean) {
  const [messages, setMessages] = useState<PollingMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch('/api/messages?limit=30');
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const { messages: fetchedMessages } = await response.json();
      setMessages(fetchedMessages.map((msg: any) => ({
        ...msg,
        createdAt: new Date(msg.createdAt)
      })));
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!userId || !hasAccess) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          content,
          messageType: 'user',
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      // Reload messages after sending
      setTimeout(loadMessages, 500);
      
      toast({
        title: "Message Sent",
        description: "Your message has been posted to the community",
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  }, [userId, hasAccess, loadMessages, toast]);

  useEffect(() => {
    if (hasAccess) {
      loadMessages();
      
      // Poll for new messages every 5 seconds
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [hasAccess, loadMessages]);

  return {
    messages,
    isLoading,
    sendMessage,
    isConnected: true, // Always true for polling
  };
}