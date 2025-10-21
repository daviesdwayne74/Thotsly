import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import Header from "@/components/Header";
import { Link } from "wouter";

export default function CreatorInfo() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-black mb-4">Build Your Creator Business</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Keep more of what you earn with our creator-friendly platform. Fair economics, powerful tools, and full control.
          </p>
        </section>

        {/* Better Economics */}
        <section className="mb-16">
          <h2 className="text-3xl font-black mb-8">Better Economics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8">
              <h3 className="text-2xl font-black mb-6">5-Tier System</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="font-bold">Tier 1: $50k+/month</span>
                  <span className="text-accent font-black">10% fee</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="font-bold">Tier 2: $25k+/month</span>
                  <span className="text-accent font-black">12% fee</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="font-bold">Tier 3: $10k+/month</span>
                  <span className="text-accent font-black">14% fee</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="font-bold">Tier 4: $2.5k+/month</span>
                  <span className="text-accent font-black">16% fee</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="font-bold">Tier 5: New Creators</span>
                  <span className="text-accent font-black">20% fee</span>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-2 border-accent">
              <h3 className="text-2xl font-black mb-6">Elite Founding Status</h3>
              <p className="text-muted-foreground mb-4">
                Reserved for the first 10 established creators earning over $50k/month who join THOTSLY. This status cannot be earned—it is only available to qualifying creators at signup.
              </p>
              <div className="bg-accent/10 p-4 rounded border border-accent/20">
                <p className="text-sm font-bold text-accent">
                  ⭐ Your fee is locked in permanently, even if platform fees change in the future.
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Tiers recalculate monthly based on your earnings. Move up or down as your revenue changes.
              </p>
            </Card>
          </div>
        </section>

        {/* Revenue by Feature */}
        <section className="mb-16">
          <h2 className="text-3xl font-black mb-8">Revenue by Feature</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h4 className="font-black mb-2">Live Streaming</h4>
              <p className="text-2xl font-black text-accent mb-2">80% Creator / 20% Platform</p>
              <p className="text-sm text-muted-foreground">Earn from tips, donations, and subscriptions during streams</p>
            </Card>

            <Card className="p-6">
              <h4 className="font-black mb-2">Tips & Donations</h4>
              <p className="text-2xl font-black text-accent mb-2">80% Creator / 20% Platform</p>
              <p className="text-sm text-muted-foreground">Direct support from your fans</p>
            </Card>

            <Card className="p-6">
              <h4 className="font-black mb-2">Pay-Per-View (PPV)</h4>
              <p className="text-2xl font-black text-accent mb-2">80% Creator / 20% Platform</p>
              <p className="text-sm text-muted-foreground">Exclusive content for one-time payments</p>
            </Card>

            <Card className="p-6">
              <h4 className="font-black mb-2">Subscriptions</h4>
              <p className="text-2xl font-black text-accent mb-2">80-90% Creator (Tier-based)</p>
              <p className="text-sm text-muted-foreground">Recurring revenue from subscribers</p>
            </Card>

            <Card className="p-6">
              <h4 className="font-black mb-2">Content Bundles</h4>
              <p className="text-2xl font-black text-accent mb-2">80% Creator / 20% Platform</p>
              <p className="text-sm text-muted-foreground">Bundle posts for discounted rates</p>
            </Card>

            <Card className="p-6">
              <h4 className="font-black mb-2">Merch Sales</h4>
              <p className="text-2xl font-black text-accent mb-2">90% Creator / 10% Platform</p>
              <p className="text-sm text-muted-foreground">Sell branded merchandise</p>
            </Card>
          </div>
        </section>

        {/* Creator Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-black mb-8">Creator Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border border-border">
              <h4 className="font-black mb-4">Content Tools</h4>
              <ul className="space-y-2 text-sm">
                <li>✓ Live streaming with real-time chat</li>
                <li>✓ 24-hour stories for daily engagement</li>
                <li>✓ Content vault to organize posts</li>
                <li>✓ Stream recording & VOD library</li>
                <li>✓ Content scheduling & automation</li>
                <li>✓ Bulk content uploads</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg border border-border">
              <h4 className="font-black mb-4">Monetization Tools</h4>
              <ul className="space-y-2 text-sm">
                <li>✓ Custom subscription pricing</li>
                <li>✓ PPV exclusive content</li>
                <li>✓ Tip/donation system</li>
                <li>✓ Merch shop integration</li>
                <li>✓ Content bundle pricing</li>
                <li>✓ Payout management</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg border border-border">
              <h4 className="font-black mb-4">Analytics & Growth</h4>
              <ul className="space-y-2 text-sm">
                <li>✓ Advanced analytics ($50/month)</li>
                <li>✓ Subscriber tracking</li>
                <li>✓ Revenue insights</li>
                <li>✓ Engagement metrics</li>
                <li>✓ Audience demographics</li>
                <li>✓ Performance reports</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg border border-border">
              <h4 className="font-black mb-4">Creator Protection</h4>
              <ul className="space-y-2 text-sm">
                <li>✓ Content watermarking</li>
                <li>✓ Screenshot protection</li>
                <li>✓ Recording prevention</li>
                <li>✓ Right-click disabled</li>
                <li>✓ Verified badge</li>
                <li>✓ Content moderation</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl font-black mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6 text-center">
              <div className="text-3xl font-black text-accent mb-2">1</div>
              <h4 className="font-black mb-2">Sign Up</h4>
              <p className="text-sm text-muted-foreground">Create your creator account</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-3xl font-black text-accent mb-2">2</div>
              <h4 className="font-black mb-2">Verify</h4>
              <p className="text-sm text-muted-foreground">Government ID verification (18+)</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-3xl font-black text-accent mb-2">3</div>
              <h4 className="font-black mb-2">Create</h4>
              <p className="text-sm text-muted-foreground">Set pricing and post content</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-3xl font-black text-accent mb-2">4</div>
              <h4 className="font-black mb-2">Earn</h4>
              <p className="text-sm text-muted-foreground">Get paid directly to your account</p>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 border-t border-border">
          <h3 className="text-2xl font-black mb-4">Ready to start earning?</h3>
          <p className="text-muted-foreground mb-6">Join thousands of creators on THOTSLY</p>
          <Button asChild size="lg" className="font-bold">
            <a href={getLoginUrl()}>Create Creator Account</a>
          </Button>
        </section>
      </main>
    </div>
  );
}

