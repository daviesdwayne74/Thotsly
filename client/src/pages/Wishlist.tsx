import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import { Link, useRoute } from "wouter";

export default function Wishlist() {
  const { user } = useAuth();
  const [, params] = useRoute("/wishlist/:creatorId");
  const creatorId = params?.creatorId || user?.id || "";

  const [newWishlistTitle, setNewWishlistTitle] = useState("");
  const [showNewWishlist, setShowNewWishlist] = useState(false);

  // Queries
  const { data: wishlists = [] } = trpc.wishlist.getCreatorWishlists.useQuery(
    { creatorId },
    { enabled: !!creatorId }
  );

  // Mutations
  const createWishlistMutation = trpc.wishlist.createWishlist.useMutation({
    onSuccess: () => {
      setNewWishlistTitle("");
      setShowNewWishlist(false);
      trpc.useUtils().wishlist.getCreatorWishlists.invalidate();
    },
  });

  const handleCreateWishlist = () => {
    if (!newWishlistTitle.trim()) return;
    createWishlistMutation.mutate({ title: newWishlistTitle });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black">Wishlists</h1>
          {user?.id === creatorId && (
            <Button onClick={() => setShowNewWishlist(!showNewWishlist)}>
              {showNewWishlist ? "Cancel" : "Create Wishlist"}
            </Button>
          )}
        </div>

        {/* Create Wishlist Form */}
        {showNewWishlist && user?.id === creatorId && (
          <Card className="p-6 mb-8">
            <h3 className="font-black mb-4">Create New Wishlist</h3>
            <div className="space-y-4">
              <Input
                placeholder="Wishlist title (e.g., 'Birthday Gifts')"
                value={newWishlistTitle}
                onChange={(e) => setNewWishlistTitle(e.target.value)}
              />
              <Button
                onClick={handleCreateWishlist}
                disabled={createWishlistMutation.isPending}
              >
                {createWishlistMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </Card>
        )}

        {/* Wishlists Grid */}
        {wishlists.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No wishlists yet</p>
            {user?.id === creatorId && (
              <Button onClick={() => setShowNewWishlist(true)}>
                Create your first wishlist
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlists.map((wishlist) => (
              <Link key={wishlist.id} href={`/wishlist/${wishlist.id}/items`}>
                <a className="group">
                  <Card className="p-6 hover:border-accent transition cursor-pointer h-full">
                    <h3 className="font-black text-lg mb-2 group-hover:text-accent transition">
                      {wishlist.title}
                    </h3>
                    {wishlist.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {wishlist.description}
                      </p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {wishlist.isActive ? "✓ Active" : "Inactive"}
                    </div>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

