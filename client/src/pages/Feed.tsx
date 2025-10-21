import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import Header from "@/components/Header";

export default function Feed() {
  const { user } = useAuth();
  const { data: posts, isLoading } = trpc.posts.feed.useQuery({});
  const likeMutation = trpc.likes.create.useMutation();
  const unlikeMutation = trpc.likes.delete.useMutation();
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());

  const handleLike = (postId: string) => {
    if (likedPostIds.has(postId)) {
      unlikeMutation.mutate({ postId });
      setLikedPostIds(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    } else {
      likeMutation.mutate({ postId });
      setLikedPostIds(prev => new Set(prev).add(postId));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-2xl mx-auto px-4 py-8">
        {isLoading ? (
          <p className="text-muted-foreground">Loading posts...</p>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="p-6 hover:border-accent transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-lg">Creator Post</p>
                    <p className="text-sm text-muted-foreground">
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Recently"}
                    </p>
                  </div>
                  {post.isPaid && (
                    <span className="bg-accent text-accent-foreground text-xs px-3 py-1 rounded-full font-bold">
                      ${(post.price / 100).toFixed(2)}
                    </span>
                  )}
                </div>
                {post.content && <p className="mb-4 text-foreground">{post.content}</p>}
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`font-semibold transition ${
                      likedPostIds.has(post.id) ? "text-accent" : "hover:text-accent"
                    }`}
                  >
                    ❤️ {post.likesCount} likes
                  </button>
                  <span>💬 {post.commentsCount} comments</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No posts yet</p>
            <Link href="/creators">
              <Button>Browse Creators</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
