import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useBasePay } from '@/hooks/useBasePay';
import { useToast } from '@/hooks/use-toast';
import { calculateStreamConfig, formatStreamAmount, getStreamProgress, calculateTimeRemaining, COMMUNITY_WALLET_ADDRESS } from '@/lib/basePay';
import { Play, Pause, Calculator, Users, DollarSign, Clock, Activity } from 'lucide-react';

interface Stream {
  id: string;
  ratePerSecond: string;
  totalAmount: string;
  streamedAmount: string;
  isActive: boolean;
  isPaused: boolean;
  endTime?: string;
}

interface StreamControlsProps {
  user: any;
  onStreamUpdate: () => void;
}

export function StreamControls({ user, onStreamUpdate }: StreamControlsProps) {
  const [ratePerSecond, setRatePerSecond] = useState('0.000001');
  const [duration, setDuration] = useState('30');
  const [customDuration, setCustomDuration] = useState('');
  const [activeStreams, setActiveStreams] = useState<Stream[]>([]);
  const [communityStats, setCommunityStats] = useState({
    totalMembers: 0,
    monthlyVolume: '0',
  });

  const { createStream, isLoading } = useBasePay();
  const { toast } = useToast();

  const durationDays = duration === 'custom' ? parseInt(customDuration) || 1 : parseInt(duration);
  const config = calculateStreamConfig(parseFloat(ratePerSecond), durationDays);

  useEffect(() => {
    if (user) {
      loadUserStreams();
      loadCommunityStats();
    }
  }, [user]);

  const loadUserStreams = async () => {
    try {
      const response = await fetch(`/api/streams/user/${user.id}`);
      const { streams } = await response.json();
      setActiveStreams(streams.filter((s: Stream) => s.isActive));
    } catch (error) {
      console.error('Failed to load streams:', error);
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

  const handleStartStream = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      const paymentResult = await createStream(parseFloat(ratePerSecond), durationDays);
      
      if (paymentResult?.success) {
        // Create stream record in backend
        const streamData = {
          userId: user.id,
          communityAddress: COMMUNITY_WALLET_ADDRESS,
          ratePerSecond: config.ratePerSecond,
          totalAmount: config.totalAmount,
          endTime: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
          paymentId: paymentResult.id,
        };

        const response = await fetch('/api/streams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(streamData),
        });

        if (response.ok) {
          await loadUserStreams();
          onStreamUpdate();
          
          toast({
            title: "Stream Started",
            description: `Successfully started streaming ${formatStreamAmount(config.totalAmount)} USDC`,
          });
        }
      }
    } catch (error) {
      console.error('Failed to start stream:', error);
    }
  };

  const handlePauseStream = async (streamId: string) => {
    try {
      const response = await fetch(`/api/streams/${streamId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPaused: true }),
      });

      if (response.ok) {
        await loadUserStreams();
        onStreamUpdate();
        
        toast({
          title: "Stream Paused",
          description: "Your stream has been paused",
        });
      }
    } catch (error) {
      console.error('Failed to pause stream:', error);
    }
  };

  const handleResumeStream = async (streamId: string) => {
    try {
      const response = await fetch(`/api/streams/${streamId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPaused: false }),
      });

      if (response.ok) {
        await loadUserStreams();
        onStreamUpdate();
        
        toast({
          title: "Stream Resumed",
          description: "Your stream has been resumed",
        });
      }
    } catch (error) {
      console.error('Failed to resume stream:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Community Wallet Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Community Wallet</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Active</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Community Address</div>
            <div className="text-sm font-mono text-gray-900 break-all">
              {COMMUNITY_WALLET_ADDRESS}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Members</div>
              <div className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                {communityStats.totalMembers}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Monthly Volume</div>
              <div className="text-2xl font-bold text-gray-900 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                {formatStreamAmount(communityStats.monthlyVolume)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stream Setup Card */}
      <Card>
        <CardHeader>
          <CardTitle>Start Streaming</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="rate">Amount per Second</Label>
            <div className="relative">
              <Input
                id="rate"
                type="number"
                step="0.000001"
                value={ratePerSecond}
                onChange={(e) => setRatePerSecond(e.target.value)}
                placeholder="0.000001"
                className="pr-16"
              />
              <div className="absolute right-3 top-2 text-gray-500 text-sm">USDC</div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="duration">Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="1">1 day</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            
            {duration === 'custom' && (
              <Input
                type="number"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                placeholder="Enter days"
                className="mt-2"
              />
            )}
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Estimated Cost</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              ~{formatStreamAmount(config.totalAmount)} USDC
            </div>
            <div className="text-xs text-gray-600">
              For {durationDays} days at {ratePerSecond} USDC/sec
            </div>
          </div>
          
          <Button 
            onClick={handleStartStream}
            disabled={isLoading || !user}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Play className="w-4 h-4 mr-2" />
            {isLoading ? 'Starting Stream...' : 'Start Stream'}
          </Button>
        </CardContent>
      </Card>

      {/* Active Streams */}
      {activeStreams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Your Active Streams
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeStreams.map((stream) => (
              <div key={stream.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${stream.isPaused ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                    <span className="font-medium text-gray-900">
                      Stream #{stream.id.slice(0, 8)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => stream.isPaused ? handleResumeStream(stream.id) : handlePauseStream(stream.id)}
                  >
                    {stream.isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                  </Button>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <span>{formatStreamAmount(stream.ratePerSecond)}/sec</span> • 
                  <span className="ml-1">{calculateTimeRemaining(stream)} left</span>
                </div>
                
                <Progress value={getStreamProgress(stream)} className="mb-2" />
                
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Streamed: {formatStreamAmount(stream.streamedAmount)}</span>
                  <span>Total: {formatStreamAmount(stream.totalAmount)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
