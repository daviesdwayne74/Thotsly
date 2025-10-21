import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";

export default function AdvancedAnalytics() {
  const { user } = useAuth();
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  const { data: subscription } = trpc.analytics.hasSubscription.useQuery({
    creatorId: user?.id || "",
  });

  const { data: analytics } = trpc.analytics.getAnalytics.useQuery(
    { creatorId: user?.id || "" },
    { enabled: subscription?.hasSubscription || false }
  ) as any;

  const { data: audience } = trpc.analytics.getAudienceInsights.useQuery(
    { creatorId: user?.id || "" },
    { enabled: subscription?.hasSubscription || false }
  ) as any;

  const { data: revenue } = trpc.analytics.getRevenueAnalytics.useQuery(
    { creatorId: user?.id || "" },
    { enabled: subscription?.hasSubscription || false }
  ) as any;

  const subscribeMutation = trpc.analytics.subscribe.useMutation();

  const handleSubscribe = () => {
    subscribeMutation.mutate({ creatorId: user?.id || "" });
  };

  if (!subscription?.hasSubscription) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container max-w-4xl mx-auto px-4 py-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-black">Advanced Analytics</h1>
            <p className="text-lg text-muted-foreground">
              Get detailed insights into your audience engagement and revenue
            </p>

            <Card className="p-12 space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">What You'll Get</h2>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <span className="text-accent">✓</span> Real-time engagement metrics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent">✓</span> Watch time analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent">✓</span> Audience demographics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent">✓</span> Revenue breakdown by source
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent">✓</span> Peak viewing times
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent">✓</span> Content performance reports
                  </li>
                </ul>
              </div>

              <div className="border-t border-border pt-6">
                <p className="text-3xl font-black text-accent mb-4">$50/month</p>
                <Button
                  onClick={handleSubscribe}
                  disabled={subscribeMutation.isPending}
                  className="w-full font-bold text-lg py-6"
                >
                  {subscribeMutation.isPending ? "Subscribing..." : "Subscribe to Analytics"}
                </Button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-black mb-8">Analytics Dashboard</h1>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Total Views</p>
            <p className="text-3xl font-black text-accent">
              {analytics?.totalViews?.toLocaleString() || "0"}
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Engagement Rate</p>
            <p className="text-3xl font-black text-accent">{analytics?.engagementRate || "0"}%</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Avg Watch Time</p>
            <p className="text-3xl font-black text-accent">
              {analytics?.averageWatchTime || "0"} min
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Subscriber Growth</p>
            <p className="text-3xl font-black text-accent">+{analytics?.subscriberGrowth || "0"}</p>
          </Card>
        </div>

        {/* Audience Insights */}
        {audience && (
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Audience Insights</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-bold mb-4">Top Locations</h3>
                <div className="space-y-2">
                  {audience?.topLocations?.map((loc: any) => (
                    <div key={loc.location} className="flex justify-between text-sm">
                      <span>{loc.location}</span>
                      <span className="font-bold">{loc.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-4">Top Devices</h3>
                <div className="space-y-2">
                  {audience?.topDevices?.map((dev: any) => (
                    <div key={dev.device} className="flex justify-between text-sm">
                      <span>{dev.device}</span>
                      <span className="font-bold">{dev.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-4">Top Referrals</h3>
                <div className="space-y-2">
                  {audience?.topReferrals?.map((ref: any) => (
                    <div key={ref.referral} className="flex justify-between text-sm">
                      <span>{ref.referral}</span>
                      <span className="font-bold">{ref.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Revenue Analytics */}
        {revenue && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Revenue Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold mb-4">Revenue by Source</h3>
                <div className="space-y-3">
                  {revenue && Object.entries(revenue.bySource).map(([source, data]: any) => (
                    <div key={source}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{source}</span>
                        <span className="font-bold">{data.percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded h-2">
                        <div
                          className="bg-accent h-2 rounded"
                          style={{ width: `${data.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-4">Top Earning Content</h3>
                <div className="space-y-2">
                  {revenue?.topEarningContent?.map((content: any) => (
                    <div key={content.contentId} className="flex justify-between text-sm p-2 bg-muted rounded">
                      <span>{content.contentId}</span>
                      <span className="font-bold">${(content.revenue / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

