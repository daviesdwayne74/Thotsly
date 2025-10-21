import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/_core/hooks/useAuth";

export default function CreatorOnboarding() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    adultContent: false,
    bannedContent: false,
    codeOfConduct: false,
  });

  const allAgreementsAccepted = Object.values(agreements).every(checked => checked === true);

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    subscriptionPrice: 9.99,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateProfile = () => {
    // In production, this would call the API
    // For now, just advance to success
    setStep(5);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-2xl mx-auto px-4 py-12">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <Card className="p-8 text-center">
            <h1 className="text-4xl font-black mb-4">Welcome to THOTSLY</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Join creators earning 80-90% on every subscription, tip, and PPV.
              <br />
              <strong>No algorithm suppression. No BS.</strong>
            </p>
            <div className="space-y-4 mb-8">
              <div className="text-left bg-accent/10 p-4 rounded">
                <p className="font-bold text-accent">✓ Keep 80-90% of earnings</p>
                <p className="text-sm text-muted-foreground">vs OnlyFans 80%</p>
              </div>
              <div className="text-left bg-accent/10 p-4 rounded">
                <p className="font-bold text-accent">✓ Better tools & features</p>
                <p className="text-sm text-muted-foreground">Live streaming, stories, vault, analytics</p>
              </div>
              <div className="text-left bg-accent/10 p-4 rounded">
                <p className="font-bold text-accent">✓ Creator-first platform</p>
                <p className="text-sm text-muted-foreground">Built for you, not against you</p>
              </div>
            </div>
            <Button size="lg" onClick={() => setStep(2)}>
              Start Creating
            </Button>
          </Card>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <Card className="p-8">
            <h2 className="text-2xl font-black mb-6">Tell Us About You</h2>
            <div className="space-y-6">
              <div>
                <label className="block font-bold mb-2">Creator Name</label>
                <Input
                  placeholder="Your creator name"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange("displayName", e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Bio</label>
                <textarea
                  className="w-full p-3 border border-border rounded"
                  placeholder="Tell fans what you're about"
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Subscription Price</label>
                <div className="flex items-center gap-2">
                  <span className="text-lg">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.subscriptionPrice}
                    onChange={(e) => handleInputChange("subscriptionPrice", parseFloat(e.target.value))}
                  />
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)}>
                  Next
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Legal Agreements */}
        {step === 3 && (
          <Card className="p-8">
            <h2 className="text-2xl font-black mb-6">Legal Agreements</h2>
            <p className="text-muted-foreground mb-6">
              Before you can create your profile, please review and agree to our legal terms.
            </p>
            <div className="space-y-4 mb-8">
              <label className="flex items-center space-x-2">
                <Checkbox checked={agreements.terms} onCheckedChange={(checked: boolean) => setAgreements(prev => ({ ...prev, terms: checked }))} />
                <span>I have read and agree to the <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Terms of Service</a></span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox checked={agreements.privacy} onCheckedChange={(checked: boolean) => setAgreements(prev => ({ ...prev, privacy: checked }))} />
                <span>I have read and agree to the <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a></span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox checked={agreements.adultContent} onCheckedChange={(checked: boolean) => setAgreements(prev => ({ ...prev, adultContent: checked }))} />
                <span>I have read and agree to the <a href="/adult-content-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Adult Content Policy</a></span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox checked={agreements.bannedContent} onCheckedChange={(checked: boolean) => setAgreements(prev => ({ ...prev, bannedContent: checked }))} />
                <span>I have read and agree to the <a href="/illegal-and-banned-content" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Illegal and Banned Content Policy</a></span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox checked={agreements.codeOfConduct} onCheckedChange={(checked: boolean) => setAgreements(prev => ({ ...prev, codeOfConduct: checked }))} />
                <span>I have read and agree to the <a href="/code-of-conduct" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Code of Conduct and Practice</a></span>
              </label>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setStep(4)} disabled={!allAgreementsAccepted}>
                Agree & Continue
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Verification */}
        {step === 4 && (
          <Card className="p-8">
            <h2 className="text-2xl font-black mb-6">Verify Your Identity</h2>
            <p className="text-muted-foreground mb-6">
              We need to verify you're 18+ to create a creator account.
            </p>
            <div className="space-y-4 mb-8">
              <p className="font-bold">Required:</p>
              <ul className="space-y-2 text-sm">
                <li>✓ Government ID (passport, driver's license, national ID)</li>
                <li>✓ Proof of age (18+)</li>
                <li>✓ Valid email</li>
              </ul>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button onClick={handleCreateProfile}>
                Create Profile
              </Button>
            </div>
          </Card>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <Card className="p-8 text-center">
            <h2 className="text-3xl font-black mb-4">🎉 Welcome to THOTSLY!</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Your creator profile is ready. Start uploading content and earning.
            </p>
            <div className="space-y-4 mb-8">
              <p className="text-sm text-muted-foreground">Next steps:</p>
              <ol className="text-left space-y-2 max-w-md mx-auto">
                <li>1. Upload your first post</li>
                <li>2. Share your creator link with fans</li>
                <li>3. Watch earnings roll in</li>
              </ol>
            </div>
            <Button size="lg">
              Go to Dashboard
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}

