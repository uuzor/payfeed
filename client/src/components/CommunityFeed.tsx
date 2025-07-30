import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Send, Heart, Reply, Settings, Crown, Shield, Trophy, Megaphone, Smile } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  userId: string;
  content: string;
  messageType: 'user' | 'system' | 'announcement';
  createdAt: Date;
  user?: {
    id: string;
    address: string;
    username?: string;
  };
  metadata?: any;
}

interface CommunityFeedProps {
  user: any;
  hasAccess: boolean;
}

export function CommunityFeed({ user, hasAccess }: CommunityFeedProps) {
  const [messageInput, setMessageInput] = useState('');
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { messages: wsMessages, isConnected, sendMessage } = useWebSocket(user?.id);

  // Combine initial messages with real-time messages
  const allMessages = [...wsMessages, ...initialMessages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  useEffect(() => {
    loadInitialMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  const loadInitialMessages = async () => {
    try {
      const response = await fetch('/api/messages?limit=30');
      const { messages } = await response.json();
      setInitialMessages(messages.map((msg: any) => ({
        ...msg,
        createdAt: new Date(msg.createdAt)
      })));
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !user || !hasAccess) return;

    sendMessage(messageInput.trim());
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getUserInitials = (user: any) => {
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    if (user?.address) {
      return user.address.slice(2, 4).toUpperCase();
    }
    return '??';
  };

  const getUserBadge = (user: any, messageType: string) => {
    if (messageType === 'system') return null;
    
    // Simple logic for badges - in a real app, this would come from user data
    const streamCount = Math.floor(Math.random() * 100); // Mock data
    
    if (streamCount > 50) {
      return <Crown className="w-3 h-3 text-yellow-500" />;
    } else if (streamCount > 20) {
      return <Trophy className="w-3 h-3 text-orange-500" />;
    } else {
      return <CheckCircle className="w-3 h-3 text-blue-600" />;
    }
  };

  const renderMessage = (message: Message) => {
    if (message.messageType === 'system') {
      return (
        <div key={message.id} className="flex items-center justify-center">
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4 mr-2 inline" />
            {message.content}
          </div>
        </div>
      );
    }

    if (message.messageType === 'announcement') {
      return (
        <div key={message.id} className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Megaphone className="w-4 h-4" />
            <span className="font-semibold">Community Announcement</span>
          </div>
          <p className="text-sm opacity-90">{message.content}</p>
        </div>
      );
    }

    return (
      <div key={message.id} className="flex items-start space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-xs font-bold">
            {getUserInitials(message.user)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-gray-900">
              {message.user?.username || `${message.user?.address?.slice(0, 6)}...${message.user?.address?.slice(-4)}`}
            </span>
            <div className="flex items-center space-x-1">
              {getUserBadge(message.user, message.messageType)}
              <span className="text-xs text-gray-500">Streaming</span>
            </div>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(message.createdAt, { addSuffix: true })}
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-800">{message.content}</p>
          </div>
          <div className="flex items-center space-x-4 mt-2">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 h-6 px-2">
              <Heart className="w-3 h-3 mr-1" />
              <span className="text-xs">3</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 h-6 px-2">
              <Reply className="w-3 h-3 mr-1" />
              <span className="text-xs">Reply</span>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (!hasAccess) {
    return (
      <Card className="h-[800px] flex items-center justify-center">
        <CardContent className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Stream Required for Access
          </h3>
          <p className="text-gray-600 mb-4">
            Start streaming to the community wallet to unlock access to the exclusive feed.
          </p>
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            Proof-of-Pay Required
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[800px] flex flex-col">
      <CardHeader className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Community Feed</CardTitle>
            <p className="text-sm text-gray-600">Exclusive access for streaming members</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium text-green-600">
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : allMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-500 mb-2">No messages yet</div>
              <div className="text-sm text-gray-400">Be the first to start the conversation!</div>
            </div>
          </div>
        ) : (
          <>
            {allMessages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </>
        )}
      </CardContent>

      <div className="border-t border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share with the community..."
                className="pr-12"
                disabled={!user || !hasAccess}
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute right-1 top-1 h-8 w-8 p-0"
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || !user || !hasAccess}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Stream active - full access enabled</span>
          </div>
          <span>{isConnected ? 'Online' : 'Offline'}</span>
        </div>
      </div>
    </Card>
  );
}
