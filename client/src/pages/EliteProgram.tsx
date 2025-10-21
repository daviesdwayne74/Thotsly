import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";

export default function EliteProgram() {
  const { user } = useAuth();
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);

  const { data: qualification } = trpc.elite.checkEliteFoundingQualification.useQuery({
    monthlyEarnings,
  });

  const { data: allTiers } = trpc.elite.getAllTiers.useQuery();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black mb-4">Creator Tier System</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            5 tiers based on monthly earnings. Higher earners pay lower platform fees. Tiers recalculate monthly.
          </p>
        </div>

        {/* Qualification Check */}
        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Check Your Tier</h2>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">Monthly Earnings</label>
            <div className="flex gap-2">
              <span className="text-2xl font-bold text-accent">$</span>
              <input
                type="number"
                value={monthlyEarnings / 100}
                onChange={(e) => setMonthlyEarnings(Number(e.target.value) * 100)}
                placeholder="50000"
                className="flex-1 px-4 py-2 border border-border rounded bg-background text-lg"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Enter your monthly earnings in dollars</p>
          </div>

          {qualification && (
            <div className={`p-4 rounded ${
              qualification.qualifies
                ? "bg-green-500/10 border border-green-500/20"
                : "bg-blue-500/10 border border-blue-500/20"
            }`}>
              <p className={`font-bold ${qualification.qualifies ? "text-green-600" : "text-blue-600"}`}>
                {qualification.message}
              </p>
            </div>
          )}
        </Card>

        {/* Tier Comparison */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">All Tiers</h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {allTiers?.map((tier) => (
              <Card key={tier.tier} className={`p-6 ${tier.tier === "tier_1" ? "border-2 border-accent" : ""}`}>
                <h3 className="text-lg font-black mb-2">{tier.name}</h3>
                <p className="text-3xl font-black text-accent mb-4">{tier.creatorEarningsPercentage}%</p>
                <p className="text-xs text-muted-foreground mb-4">Creator earnings</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Platform fee:</span>
                    <span className="font-bold">{tier.platformFeePercentage}%</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <p className="text-xs font-bold">${(tier.minEarnings / 100).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{tier.description}</p>
                  </div>
                </div>

                {tier.tier === "tier_1" && (
                  <div className="mt-4 p-2 bg-accent/10 rounded text-xs font-bold text-accent">
                    ⭐ Elite Founding: 10% locked for life
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">How It Works</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold mb-2">How are tiers determined?</h3>
              <p className="text-muted-foreground">
                Tiers are based solely on your monthly earnings. The more you earn, the lower your platform fee.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">When do tiers recalculate?</h3>
              <p className="text-muted-foreground">
                Tiers recalculate monthly based on your total earnings for that month. If you earn more, you automatically move to a better tier.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">What is Elite Founding?</h3>
              <p className="text-muted-foreground">
                Elite Founding is for Tier 1 creators ($50,000+/month). You get a locked 10% platform fee for life, even if fees change in the future.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Can I move between tiers?</h3>
              <p className="text-muted-foreground">
                Yes. Tiers recalculate monthly. If your earnings increase or decrease, your tier will adjust accordingly. Elite Founding status is permanent once earned.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">What's the difference between tiers?</h3>
              <p className="text-muted-foreground">
                The only difference is the platform fee percentage. Tier 1 pays 10%, while Tier 5 pays 20%. All other features are identical across tiers.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">How do I move up a tier?</h3>
              <p className="text-muted-foreground">
                Earn more money. The tier thresholds are: Tier 1 ($50k+), Tier 2 ($25k+), Tier 3 ($10k+), Tier 4 ($2.5k+), Tier 5 (all new creators).
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

