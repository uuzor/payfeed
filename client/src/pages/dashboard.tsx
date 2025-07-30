import { useState, useEffect } from 'react';
import { WalletConnection } from '@/components/WalletConnection';
import { StreamControls } from '@/components/StreamControls';
import { CommunityFeed } from '@/components/CommunityFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Podcast, Users, DollarSign, Clock, TrendingUp, Award, Activity } from 'lucide-react';

interface User {
  id: string;
  address: string;
  username?: string;
  isVerified: boolean;
}

interface AccessInfo {
  hasAccess: boolean;
  activeStreams: any[];
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [accessInfo, setAccessInfo] = useState<AccessInfo>({ hasAccess: false, activeStreams: [] });
  const [communityStats, setCommunityStats] = useState({
    totalMembers: 0,
    activeStreamers: 0,
    totalStreamed: '0',
    monthlyVolume: '0',
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkAccess();
      loadCommunityStats();
    }
  }, [user]);

  const checkAccess = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/verify-access/${user.id}`);
      const data = await response.json();
      setAccessInfo(data);
    } catch (error) {
      console.error('Failed to check access:', error);
    }
  };

  const loadCommunityStats = async () => {
    try {
      const response = await fetch('/api/community/stats');
      const { stats } = await response.json();
      setCommunityStats(stats);
    } catch (error) {
      console.error('Failed to load community stats:', error);
    }
  };

  const handleUserConnect = (connectedUser: User) => {
    setUser(connectedUser);
    toast({
      title: "Welcome to StreamPay",
      description: "Start streaming to unlock community access",
    });
  };

  const handleStreamUpdate = () => {
    checkAccess();
    loadCommunityStats();
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    if (num < 0.001) return `${(num * 1000000).toFixed(2)}μ`;
    if (num < 1) return `${(num * 1000).toFixed(2)}m`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Podcast className="text-white text-sm" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">StreamPay</h1>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Community</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Streams</a>
            </nav>

            <div className="flex items-center space-x-4">
              <WalletConnection onUserConnect={handleUserConnect} user={user} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Podcast Controls */}
          <div className="lg:col-span-1">
            <StreamControls user={user} onStreamUpdate={handleStreamUpdate} />
          </div>

          {/* Main Content - Community Feed */}
          <div className="lg:col-span-2">
            <CommunityFeed user={user} hasAccess={accessInfo.hasAccess} />
          </div>
        </div>

        {/* Bottom Stats Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Community Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Community Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600">Active Streamers</span>
                </div>
                <span className="font-bold text-gray-900">{communityStats.activeStreamers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Total Streamed</span>
                </div>
                <span className="font-bold text-gray-900">{formatAmount(communityStats.totalStreamed)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-600">Monthly Volume</span>
                </div>
                <span className="font-bold text-gray-900">{formatAmount(communityStats.monthlyVolume)}</span>
              </div>
            </CardContent>
          </Card>

          {/* User Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Wallet Connected</span>
                <Badge variant={user ? "default" : "secondary"}>
                  {user ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Community Access</span>
                <Badge variant={accessInfo.hasAccess ? "default" : "secondary"}>
                  {accessInfo.hasAccess ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Streams</span>
                <span className="font-bold text-gray-900">{accessInfo.activeStreams.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user && accessInfo.hasAccess ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1 text-sm">
                      <span className="font-medium">You</span>
                      <span className="text-gray-600"> started streaming</span>
                      <div className="text-xs text-gray-500">Active now</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-gray-500 text-sm">
                    Connect wallet and start streaming to see activity
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center space-y-1 text-blue-600">
            <Activity className="w-5 h-5" />
            <span className="text-xs">Feed</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-gray-600">
            <Podcast className="w-5 h-5" />
            <span className="text-xs">Streams</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-gray-600">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs">Stats</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-gray-600">
            <Users className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
