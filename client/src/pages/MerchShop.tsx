import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useRoute } from "wouter";

export default function MerchShop() {
  const { user } = useAuth();
  const [, params] = useRoute("/creator/:id/merch");
  const creatorId = params?.id || "";
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "0",
    inventory: "0",
  });

  const { data: products } = trpc.merch.listByCreator.useQuery({ creatorId });
  const { data: profile } = trpc.creators.getProfile.useQuery({ id: creatorId });
  const createMutation = trpc.merch.create.useMutation({
    onSuccess: () => {
      setShowCreateForm(false);
      setFormData({ name: "", description: "", price: "0", inventory: "0" });
    },
  });

  const isCreator = user && profile?.userId === user.id;

  const handleCreateProduct = () => {
    if (!formData.name) return;
    createMutation.mutate({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      inventory: parseInt(formData.inventory),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Merch Shop</h1>
          <Link href={`/creator/${creatorId}`}>
            <Button variant="ghost">Back</Button>
          </Link>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Creator Info */}
        {profile && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">{profile.displayName}'s Merch</h2>
            <p className="text-muted-foreground">{profile.bio}</p>
          </div>
        )}

        {/* Create Product Form (Creator Only) */}
        {isCreator && (
          <div className="mb-8">
            {!showCreateForm ? (
              <Button onClick={() => setShowCreateForm(true)}>Add Product</Button>
            ) : (
              <Card className="p-6 max-w-md">
                <h3 className="text-lg font-bold mb-4">Create Product</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="T-Shirt, Hoodie, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Product description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Price ($)</label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Inventory</label>
                    <Input
                      type="number"
                      value={formData.inventory}
                      onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateProduct}
                      disabled={!formData.name || createMutation.isPending}
                      className="flex-1"
                    >
                      {createMutation.isPending ? "Creating..." : "Create"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Products Grid */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold mb-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                  )}
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-bold">${(product.price / 100).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.inventory} in stock
                    </p>
                  </div>
                  <Button className="w-full">Add to Cart</Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No products yet</p>
            {isCreator && (
              <Button onClick={() => setShowCreateForm(true)}>Create First Product</Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

