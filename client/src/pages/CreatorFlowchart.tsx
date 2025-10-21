import Header from "@/components/Header";
import { Card } from "@/components/ui/card";

export default function CreatorFlowchart() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black mb-12 text-center">
          Creator Journey on THOTSLY
        </h1>

        {/* Flowchart */}
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-accent text-white font-black">
                1
              </div>
            </div>
            <Card className="flex-1 p-6">
              <h3 className="text-xl font-black mb-2">Sign Up (2 minutes)</h3>
              <p className="text-muted-foreground">
                Create account with email. Verify your identity with government ID (18+).
              </p>
            </Card>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="text-4xl text-accent">↓</div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-accent text-white font-black">
                2
              </div>
            </div>
            <Card className="flex-1 p-6">
              <h3 className="text-xl font-black mb-2">Create Profile (5 minutes)</h3>
              <p className="text-muted-foreground">
                Add bio, profile picture, set subscription price (you control pricing).
              </p>
            </Card>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="text-4xl text-accent">↓</div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-accent text-white font-black">
                3
              </div>
            </div>
            <Card className="flex-1 p-6">
              <h3 className="text-xl font-black mb-2">Upload Content (Ongoing)</h3>
              <p className="text-muted-foreground">
                Post photos, videos, stories. Go live. Create exclusive content. Set PPV prices.
              </p>
            </Card>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="text-4xl text-accent">↓</div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-accent text-white font-black">
                4
              </div>
            </div>
            <Card className="flex-1 p-6">
              <h3 className="text-xl font-black mb-2">Share & Promote (Ongoing)</h3>
              <p className="text-muted-foreground">
                Share your creator link on social media. Drive fans to THOTSLY. Build your audience.
              </p>
            </Card>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="text-4xl text-accent">↓</div>
          </div>

          {/* Step 5 */}
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-accent text-white font-black">
                5
              </div>
            </div>
            <Card className="flex-1 p-6 border-accent border-2">
              <h3 className="text-xl font-black mb-2 text-accent">Earn Money 💰</h3>
              <p className="text-muted-foreground mb-4">
                Fans subscribe, tip, buy PPV, and purchase merch. You keep 80-90%.
              </p>
              <div className="space-y-2 text-sm">
                <p>✓ Subscriptions: 80-90% (based on tier)</p>
                <p>✓ Tips: 80%</p>
                <p>✓ PPV: 80%</p>
                <p>✓ Merch: 85%</p>
                <p>✓ Wishlist: 95%</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Key Points */}
        <div className="mt-12 p-6 bg-accent/10 rounded-lg">
          <h3 className="font-black mb-4">Why THOTSLY is Different:</h3>
          <ul className="space-y-2 text-sm">
            <li>✓ <strong>You set your own prices</strong> - not THOTSLY</li>
            <li>✓ <strong>No algorithm suppression</strong> - your content gets seen</li>
            <li>✓ <strong>Better payouts</strong> - 80-90% vs OnlyFans 80%</li>
            <li>✓ <strong>More features</strong> - live streaming, stories, vault, analytics</li>
            <li>✓ <strong>Creator-first</strong> - built for you, not against you</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

