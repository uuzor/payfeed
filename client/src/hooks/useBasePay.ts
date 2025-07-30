import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { calculateStreamConfig, COMMUNITY_WALLET_ADDRESS, TESTNET } from '@/lib/basePay';

interface PaymentResult {
  id: string;
  success: boolean;
  error?: string;
}

export function useBasePay() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const initiatePay = useCallback(async (amount: string): Promise<PaymentResult | null> => {
    setIsLoading(true);
    
    try {
      // Dynamic import to avoid issues if SDK is not available
      const { pay } = await import('@base-org/account');
      
      const result = await pay({
        amount,
        to: COMMUNITY_WALLET_ADDRESS,
        testnet: TESTNET,
      });

      toast({
        title: "Payment Initiated",
        description: `Stream payment of $${amount} USDC initiated successfully`,
      });

      return {
        id: result.id,
        success: true,
      };
    } catch (error: any) {
      console.error('Payment failed:', error);
      
      const errorMessage = error?.message || 'Payment failed';
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return {
        id: '',
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const checkPaymentStatus = useCallback(async (paymentId: string): Promise<'pending' | 'completed' | 'failed'> => {
    try {
      const { getPaymentStatus } = await import('@base-org/account');
      
      const result = await getPaymentStatus({
        id: paymentId,
        testnet: TESTNET,
      });

      return result.status as 'pending' | 'completed' | 'failed';
    } catch (error) {
      console.error('Payment status check failed:', error);
      return 'failed';
    }
  }, []);

  const createStream = useCallback(async (ratePerSecond: number, durationDays: number) => {
    const config = calculateStreamConfig(ratePerSecond, durationDays);
    return await initiatePay(config.totalAmount);
  }, [initiatePay]);

  return {
    initiatePay,
    checkPaymentStatus,
    createStream,
    isLoading,
  };
}
