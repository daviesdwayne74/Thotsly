import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useRoute, Link } from "wouter";

export default function CreatorProfile() {
  const { user } = useAuth();
  const [, params] = useRoute("/creator/:id");
  const creatorId = params?.id || "";
  const [activeTab, setActiveTab] = useState<"posts" | "about" | "merch">("posts");

  const { data: profile } = trpc.creators.getProfile.useQuery({ id: creatorId });
  const { data: posts } = trpc.posts.getByCreator.useQuery({ creatorId }, { enabled: !!creatorId });

  const isOwnProfile = user && profile?.userId === user.id;

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Creator not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      {profile.bannerUrl && (
        <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-500 overflow-hidden">
          <img src={profile.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Profile Header */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Avatar & Info */}
          <div className="flex-shrink-0">
            {profile.avatarUrl && (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-lg"
              />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{profile.displayName}</h1>
              {profile.isVerified && <span className="text-2xl">✓</span>}
            </div>

            {profile.bio && <p className="text-lg text-muted-foreground mb-4">{profile.bio}</p>}

            {/* Stats */}
            <div className="flex gap-8 mb-6">
              <div>
                <p className="text-2xl font-bold">{profile.totalSubscribers}</p>
                <p className="text-sm text-muted-foreground">Subscribers</p>
              </div>
              <div>
                <p className="text-2xl font-bold">${(profile.subscriptionPrice / 100).toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Monthly</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {isOwnProfile ? (
                <>
                  <Link href="/dashboard">
                    <Button>Edit Profile</Button>
                  </Link>
                  <Link href="/create-post">
                    <Button variant="outline">Create Post</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button>Subscribe ${(profile.subscriptionPrice / 100).toFixed(2)}/mo</Button>
                  <Button variant="outline">Message</Button>
                  <Button variant="outline">Tip</Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-8">
          <div className="flex gap-8">
            {["posts", "about", "merch"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? "border-b-2 border-foreground text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "posts" && (
          <div className="space-y-6">
            {posts && posts.length > 0 ? (
              posts.map((post) => (
                <Card key={post.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold">Post</p>
                      <p className="text-sm text-muted-foreground">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Recently"}
                      </p>
                    </div>
                    {post.isPaid && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        ${(post.price / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                  {post.content && <p className="mb-4">{post.content}</p>}
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <span>❤️ {post.likesCount} likes</span>
                    <span>💬 {post.commentsCount} comments</span>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-12">No posts yet</p>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">About {profile.displayName}</h2>
            <p className="text-muted-foreground">{profile.bio || "No bio provided"}</p>
          </Card>
        )}

        {activeTab === "merch" && (
          <Link href={`/creator/${creatorId}/merch`}>
            <Button>View Merch Shop</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

