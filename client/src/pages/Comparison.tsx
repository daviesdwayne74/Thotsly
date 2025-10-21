import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Comparison() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-4 text-center">
          THOTSLY vs OnlyFans
        </h1>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Why creators are switching to THOTSLY
        </p>

        {/* Comparison Table */}
        <div className="overflow-x-auto mb-12">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-accent">
                <th className="text-left p-4 font-black">Feature</th>
                <th className="text-center p-4 font-black text-accent">THOTSLY</th>
                <th className="text-center p-4 font-black">OnlyFans</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border hover:bg-accent/5">
                <td className="p-4 font-bold">Subscription Split</td>
                <td className="text-center p-4 text-accent font-bold">80-90%</td>
                <td className="text-center p-4">80%</td>
              </tr>
              <tr className="border-b border-border hover:bg-accent/5">
                <td className="p-4 font-bold">Tips/Donations</td>
                <td className="text-center p-4 text-accent font-bold">80%</td>
                <td className="text-center p-4">80%</td>
              </tr>
              <tr className="border-b border-border hover:bg-accent/5">
                <td className="p-4 font-bold">PPV Content</td>
                <td className="text-center p-4 text-accent font-bold">80%</td>
                <td className="text-center p-4">80%</td>
              </tr>
              <tr className="border-b border-border hover:bg-accent/5">
                <td className="p-4 font-bold">Live Streaming</td>
                <td className="text-center p-4 text-accent font-bold">✓ Yes</td>
                <td className="text-center p-4">✗ No</td>
              </tr>
              <tr className="border-b border-border hover:bg-accent/5">
                <td className="p-4 font-bold">Stories (24h)</td>
                <td className="text-center p-4 text-accent font-bold">✓ Yes</td>
                <td className="text-center p-4">✗ No</td>
              </tr>
              <tr className="border-b border-border hover:bg-accent/5">
                <td className="p-4 font-bold">Content Vault</td>
                <td className="text-center p-4 text-accent font-bold">✓ Yes</td>
                <td className="text-center p-4">✗ No</td>
              </tr>
              <tr className="border-b border-border hover:bg-accent/5">
                <td className="p-4 font-bold">Analytics</td>
                <td className="text-center p-4 text-accent font-bold">✓ Advanced</td>
                <td className="text-center p-4">Basic</td>
              </tr>
              <tr className="border-b border-border hover:bg-accent/5">
                <td className="p-4 font-bold">Watermarking</td>
                <td className="text-center p-4 text-accent font-bold">✓ Auto</td>
                <td className="text-center p-4">✗ No</td>
              </tr>
              <tr className="border-b border-border hover:bg-accent/5">
                <td className="p-4 font-bold">Merch Integration</td>
                <td className="text-center p-4 text-accent font-bold">✓ Yes</td>
                <td className="text-center p-4">✗ No</td>
              </tr>
              <tr className="border-b border-border hover:bg-accent/5">
                <td className="p-4 font-bold">Wishlist</td>
                <td className="text-center p-4 text-accent font-bold">✓ Yes</td>
                <td className="text-center p-4">✗ No</td>
              </tr>
              <tr className="border-b border-border hover:bg-accent/5">
                <td className="p-4 font-bold">Algorithm Suppression</td>
                <td className="text-center p-4 text-accent font-bold">✗ None</td>
                <td className="text-center p-4">✓ Yes</td>
              </tr>
              <tr className="hover:bg-accent/5">
                <td className="p-4 font-bold">Creator Support</td>
                <td className="text-center p-4 text-accent font-bold">✓ Priority</td>
                <td className="text-center p-4">Basic</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Key Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 border-accent/50">
            <h3 className="text-xl font-black mb-3 text-accent">Better Payouts</h3>
            <p className="text-muted-foreground">
              Keep 80-90% of every subscription, tip, and PPV. No hidden fees.
            </p>
          </Card>

          <Card className="p-6 border-accent/50">
            <h3 className="text-xl font-black mb-3 text-accent">Better Tools</h3>
            <p className="text-muted-foreground">
              Live streaming, stories, vault, analytics, and more. Built for creators.
            </p>
          </Card>

          <Card className="p-6 border-accent/50">
            <h3 className="text-xl font-black mb-3 text-accent">No Suppression</h3>
            <p className="text-muted-foreground">
              Fair algorithm. Your content gets seen. No artificial suppression.
            </p>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-black mb-6">Ready to Switch?</h2>
          <Button size="lg" className="text-lg px-8 py-6">
            Create Your Creator Account
          </Button>
        </div>
      </main>
    </div>
  );
}

