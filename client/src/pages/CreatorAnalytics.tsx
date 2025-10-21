import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";

export default function CreatorAnalytics() {
  const { user } = useAuth();
  const { data: profile } = trpc.creators.getByUserId.useQuery(
    { userId: user?.id || "" },
    { enabled: !!user?.id }
  );
  const { data: payouts } = trpc.payment.getCreatorPayouts.useQuery(undefined, {
    enabled: !!profile,
  });

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">You must be a creator to view analytics</p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Creator Analytics</h1>
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Earnings</p>
            <p className="text-3xl font-bold">${((payouts?.totalEarnings || 0) / 100).toFixed(2)}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Subscribers</p>
            <p className="text-3xl font-bold">{profile.totalSubscribers}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Subscription Price</p>
            <p className="text-3xl font-bold">${(profile.subscriptionPrice / 100).toFixed(2)}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Verified</p>
            <p className="text-3xl font-bold">{profile.isVerified ? "✓" : "—"}</p>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Performance Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-bold">${((payouts?.totalEarnings || 0) / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Growth Rate</p>
              <p className="text-2xl font-bold text-green-600">+12%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Engagement Rate</p>
              <p className="text-2xl font-bold">8.4%</p>
            </div>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          {payouts?.recentTransactions && payouts.recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {payouts.recentTransactions.map((tx: any) => (
                <div key={tx.id} className="flex justify-between items-center p-3 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium capitalize">{tx.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {tx.description || new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${(tx.amount / 100).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground capitalize">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No transactions yet</p>
          )}
        </Card>
      </main>
    </div>
  );
}

