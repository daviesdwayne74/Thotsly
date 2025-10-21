import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import Header from "@/components/Header";

export default function Creators() {
  const { data: creators, isLoading } = trpc.creators.list.useQuery({});

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-black mb-8">Browse Creators</h1>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : creators && creators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creators.map((creator) => (
              <Link key={creator.id} href={`/creator/${creator.id}`}>
                <a className="group">
                  <Card className="p-6 hover:border-accent transition cursor-pointer">
                    <h3 className="font-black text-lg group-hover:text-accent mb-2">{creator.displayName}</h3>
                    {creator.isVerified && <span className="text-accent text-xs font-bold">✓ Verified</span>}
                    {creator.bio && <p className="text-sm text-muted-foreground mt-2">{creator.bio}</p>}
                    <div className="mt-4 flex justify-between text-sm">
                      <div><p className="font-bold text-accent">{creator.totalSubscribers}</p><p className="text-xs text-muted-foreground">Subscribers</p></div>
                      <div className="text-right"><p className="font-bold text-accent">${(creator.subscriptionPrice / 100).toFixed(2)}</p><p className="text-xs text-muted-foreground">/mo</p></div>
                    </div>
                    <Button className="w-full mt-4 font-bold" size="sm">View</Button>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No creators found</p>
        )}
      </main>
    </div>
  );
}
