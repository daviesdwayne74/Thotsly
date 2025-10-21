import React, { useState, useEffect } from 'react';
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/utils/formatters";
import { toast } from "sonner";

interface PayoutHistoryItem {
  id: string;
  amount: number;
  amountInDollars: string;
  status: string;
  timestamp: Date;
  arrivalDate?: Date | undefined;
  failureReason?: string;
}

const PayoutDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stripeAccountStatus, setStripeAccountStatus] = useState<string | null>(null);

  const { data: payoutBalance, isLoading: isLoadingPayoutBalance, refetch: refetchPayoutBalance } = trpc.payout.getPayoutBalance.useQuery(undefined, {
    enabled: !!user?.id,
  });

  const { data: connectedAccountStatus, isLoading: isLoadingConnectedAccountStatus, refetch: refetchConnectedAccountStatus } = trpc.payout.getConnectedAccountStatus.useQuery(undefined, {
    enabled: !!user?.id,
  });
  const { data: feeTierInfo, isLoading: isLoadingFeeTierInfo, refetch: refetchFeeTierInfo } = trpc.payout.getCreatorFeeInfo.useQuery(undefined, {
    enabled: !!user?.id,
  });

  const payoutInfo = React.useMemo(() => ({
    currentBalance: payoutBalance ? { available: payoutBalance.balanceInCents, pending: 0 } : undefined,
    stripeConnectAccount: connectedAccountStatus ? { id: connectedAccountStatus.accountId, detailsSubmitted: connectedAccountStatus.status === 'active', chargesEnabled: connectedAccountStatus.status === 'active' } : undefined,
    feeTier: feeTierInfo,
  }), [payoutBalance, connectedAccountStatus, feeTierInfo]);

  const isLoadingPayoutInfo = isLoadingPayoutBalance || isLoadingConnectedAccountStatus || isLoadingFeeTierInfo;


  const refetchPayoutInfo = () => {
    refetchPayoutBalance();
    refetchConnectedAccountStatus();
    refetchFeeTierInfo();
  };

  const { data: payoutHistory, isLoading: isLoadingPayoutHistory, refetch: refetchPayoutHistory } = trpc.payout.getPayoutHistory.useQuery({}, {
    enabled: !!user?.id,
  });

  const createStripeAccountLinkMutation = trpc.payout.getOnboardingLink.useMutation({
    onSuccess: (data: { onboardingUrl?: string }) => {
      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      }
    },
    onError: (error: { message: string }) => {
      toast.error("Failed to create Stripe Connect account link:", { description: error.message });
    },
  });



  useEffect(() => {
    if (connectedAccountStatus?.connected) {
      if (connectedAccountStatus.status === "active") {
        setStripeAccountStatus("Connected");
      } else {
        setStripeAccountStatus("Pending Setup");
      }
    } else {
      setStripeAccountStatus("Not Connected");
    }
  }, [connectedAccountStatus]);

  const handleConnectStripe = () => {
    createStripeAccountLinkMutation.mutate({
      returnUrl: window.location.origin + "/payout-dashboard", // Adjust as needed
      refreshUrl: window.location.origin + "/payout-dashboard", // Adjust as needed
    });
  };

  const handleDisconnectStripe = () => {
    // No direct disconnect API. Creators manage their connected account directly through Stripe.
    // disconnectStripeAccountMutation.mutate();
    toast.info("To disconnect your Stripe account, please manage it directly through your Stripe dashboard.");
  };

  if (isLoadingPayoutInfo || isLoadingPayoutHistory) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-4xl mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <h1 className="text-3xl font-bold mb-6">Loading Payout Dashboard...</h1>
            <p>Please wait while we fetch your payout information.</p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-8">Creator Payout Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-primary">
                {formatCurrency(payoutInfo?.currentBalance?.available || 0)}
              </p>
              <p className="text-muted-foreground mt-2">Pending: {formatCurrency(payoutInfo?.currentBalance?.pending || 0)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stripe Connect Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold mb-4">Status: {stripeAccountStatus}</p>
              {stripeAccountStatus === "Not Connected" && (
                <Button onClick={handleConnectStripe} disabled={createStripeAccountLinkMutation.isPending}>
                  {createStripeAccountLinkMutation.isPending ? "Connecting..." : "Connect Stripe Account"}
                </Button>
              )}
              {stripeAccountStatus === "Pending Setup" && (
                <Button onClick={handleConnectStripe} variant="outline" disabled={createStripeAccountLinkMutation.isPending}>
                  {createStripeAccountLinkMutation.isPending ? "Continuing Setup..." : "Continue Stripe Setup"}
                </Button>
              )}
              {stripeAccountStatus === "Connected" && (
                <Button onClick={handleDisconnectStripe} variant="destructive">
                  Disconnect Stripe Account
                </Button>
              )}
              {connectedAccountStatus?.connected && connectedAccountStatus?.status !== "active" && (
                <p className="text-sm text-red-500 mt-2">Your Stripe account is not fully set up or active. Please complete the setup process.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Fee Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold mb-2">Current Tier: {payoutInfo?.feeTier?.tierName || 'N/A'}</p>
            <p className="text-muted-foreground">Platform Fee: {payoutInfo?.feeTier?.platformFeePercentage}%</p>
            <p className="text-muted-foreground">Your Share: {100 - (payoutInfo?.feeTier?.platformFeePercentage || 0)}%</p>
            {payoutInfo?.feeTier?.isEliteFounding && (
              <p className="text-green-500 font-semibold mt-2">You have Elite Founding Status!</p>
            )}
            <p className="text-sm text-muted-foreground mt-4">
              Your tier is recalculated monthly based on your earnings. Elite Founding Status is permanent.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
          </CardHeader>
          <CardContent>
            {payoutHistory && payoutHistory.length > 0 ? (
              <div className="space-y-4">
                {payoutHistory.map((payout: PayoutHistoryItem) => (
                  <div key={payout.id} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                    <div>
                      <p className="font-medium">{payout.amountInDollars}</p>
                      <p className="text-sm text-muted-foreground">{new Date(payout.timestamp).toLocaleDateString()}</p>
                    </div>
                    <p className={`font-semibold ${payout.status === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                      {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No payout history available yet.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PayoutDashboard;

