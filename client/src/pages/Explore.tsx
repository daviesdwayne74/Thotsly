import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"trending" | "new" | "verified">("trending");

  const { data: trendingCreators } = trpc.discovery.getTrendingCreators.useQuery({ limit: 20 });
  const { data: newCreators } = trpc.discovery.getNewCreators.useQuery({ limit: 20 });
  const { data: verifiedCreators } = trpc.discovery.getVerifiedCreators.useQuery({ limit: 20 });
  const { data: searchResults } = trpc.discovery.searchCreators.useQuery(
    { query: searchQuery, limit: 20 },
    { enabled: searchQuery.length > 0 }
  );

  const displayedCreators =
    searchQuery.length > 0
      ? searchResults
      : activeTab === "trending"
        ? trendingCreators
        : activeTab === "new"
          ? newCreators
          : verifiedCreators;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold mb-4">Explore Creators</h1>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creators..."
            className="max-w-md"
          />
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        {!searchQuery && (
          <div className="flex gap-4 mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab("trending")}
              className={`pb-2 px-4 font-medium transition-colors ${
                activeTab === "trending"
                  ? "border-b-2 border-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => setActiveTab("new")}
              className={`pb-2 px-4 font-medium transition-colors ${
                activeTab === "new"
                  ? "border-b-2 border-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              New
            </button>
            <button
              onClick={() => setActiveTab("verified")}
              className={`pb-2 px-4 font-medium transition-colors ${
                activeTab === "verified"
                  ? "border-b-2 border-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Verified
            </button>
          </div>
        )}

        {/* Creators Grid */}
        {displayedCreators && displayedCreators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCreators.map((creator) => (
              <Card key={creator.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {creator.bannerUrl && (
                  <img
                    src={creator.bannerUrl}
                    alt={creator.displayName}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-6">
                  {creator.avatarUrl && (
                    <img
                      src={creator.avatarUrl}
                      alt={creator.displayName}
                      className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                    />
                  )}
                  <h3 className="text-lg font-bold text-center mb-2">
                    {creator.displayName}
                    {creator.isVerified && <span className="ml-2">✓</span>}
                  </h3>
                  {creator.bio && (
                    <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-2">
                      {creator.bio}
                    </p>
                  )}

                  <div className="space-y-2 mb-4 text-center text-sm">
                    <p className="font-semibold">{creator.totalSubscribers} subscribers</p>
                    <p className="text-muted-foreground">
                      ${(creator.subscriptionPrice / 100).toFixed(2)}/month
                    </p>
                  </div>

                  <Link href={`/creator/${creator.id}`}>
                    <Button className="w-full">View Profile</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? "No creators found" : "No creators available"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

