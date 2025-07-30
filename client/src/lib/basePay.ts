// BasePay integration utilities
export const COMMUNITY_WALLET_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc9e7595f6E456";
export const TESTNET = true; // Set to false for mainnet

export interface StreamConfig {
  ratePerSecond: string;
  durationDays: number;
  totalAmount: string;
}

export function calculateStreamConfig(ratePerSecond: number, durationDays: number): StreamConfig {
  const secondsPerDay = 24 * 60 * 60;
  const totalSeconds = durationDays * secondsPerDay;
  const totalAmount = (ratePerSecond * totalSeconds).toFixed(6);
  
  return {
    ratePerSecond: ratePerSecond.toString(),
    durationDays,
    totalAmount,
  };
}

export function formatStreamAmount(amount: string): string {
  const num = parseFloat(amount);
  if (num < 0.001) return `${(num * 1000000).toFixed(2)}μ`;
  if (num < 1) return `${(num * 1000).toFixed(2)}m`;
  return `$${num.toFixed(2)}`;
}

export function getStreamProgress(stream: any): number {
  const streamed = parseFloat(stream.streamedAmount || "0");
  const total = parseFloat(stream.totalAmount || "1");
  return Math.min((streamed / total) * 100, 100);
}

export function calculateTimeRemaining(stream: any): string {
  if (!stream.endTime) return "Unknown";
  
  const now = new Date();
  const end = new Date(stream.endTime);
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return "Ended";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days} days`;
  if (hours > 0) return `${hours} hours`;
  return "< 1 hour";
}
