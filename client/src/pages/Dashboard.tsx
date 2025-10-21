import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import Header from "@/components/Header";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [price, setPrice] = useState("");

  const { data: profile } = trpc.creators.getProfile.useQuery({ id: user?.id || "" }, { enabled: !!user?.id });

  const handleUpdate = () => {
    if (!displayName || !price) return;
    // Profile update would be implemented here
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-black mb-8">Creator Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <p className="text-3xl font-black text-accent mb-1">0</p>
            <p className="text-sm text-muted-foreground">Subscribers</p>
          </Card>
          <Card className="p-6">
            <p className="text-3xl font-black text-accent mb-1">$0</p>
            <p className="text-sm text-muted-foreground">Total Earnings</p>
          </Card>
          <Card className="p-6">
            <p className="text-3xl font-black text-accent mb-1">0</p>
            <p className="text-sm text-muted-foreground">Posts</p>
          </Card>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-black mb-6">Profile Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Display Name</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Bio</label>
              <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Subscription Price ($)</label>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="9.99" />
            </div>
            <Button onClick={handleUpdate} className="font-bold">
              Save Changes
            </Button>
          </div>
        </Card>

        <div className="mt-8">
          <Link href="/create-post">
            <Button className="font-bold">Create New Post</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
