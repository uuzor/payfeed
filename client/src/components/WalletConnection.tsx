import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wallet, CheckCircle, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  address: string;
  username?: string;
  isVerified: boolean;
}

interface WalletConnectionProps {
  onUserConnect: (user: User) => void;
  user: User | null;
}

export function WalletConnection({ onUserConnect, user }: WalletConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const connectWallet = async () => {
    setIsConnecting(true);
    
    try {
      // Dynamic import to handle potential missing SDK
      const { createBaseAccountSDK } = await import('@base-org/account');
      
      const sdk = createBaseAccountSDK({
        appName: 'StreamPay Community',
        appLogoUrl: 'https://base.org/logo.png',
        appChainIds: [8453], // Base mainnet
      });

      const provider = sdk.getProvider();
      
      // Get accounts
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
        params: [],
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      
      // Sign a message for authentication
      const message = `Sign in to StreamPay Community\nAddress: ${address}\nTimestamp: ${Date.now()}`;
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, address],
      });

      // Send to backend for verification
      const response = await fetch('/api/auth/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          signature,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const { user } = await response.json();
      onUserConnect(user);

      toast({
        title: "Wallet Connected",
        description: `Connected as ${user.address.slice(0, 6)}...${user.address.slice(-4)}`,
      });

    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  if (user) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-3 py-1 rounded-lg">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">
            {user.address.slice(0, 6)}...{user.address.slice(-4)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Button 
      onClick={connectWallet}
      disabled={isConnecting}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      <Wallet className="w-4 h-4 mr-2" />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}
