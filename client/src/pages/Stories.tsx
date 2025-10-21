import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";

export default function Stories() {
  const { user } = useAuth();
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [caption, setCaption] = useState("");

  const createMutation = trpc.features.stories.create.useMutation();

  const handleCreateStory = () => {
    if (!mediaUrl.trim()) return;

    createMutation.mutate(
      {
        mediaUrl,
        mediaType,
        caption,
      },
      {
        onSuccess: () => {
          setMediaUrl("");
          setCaption("");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-black mb-8">Stories</h1>

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-black mb-6">Create Story</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Media Type</label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as "image" | "video")}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Media URL</label>
              <Input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Caption (Optional)</label>
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption..."
              />
            </div>

            <Button
              onClick={handleCreateStory}
              disabled={createMutation.isPending || !mediaUrl.trim()}
              className="w-full font-bold text-lg py-6"
            >
              {createMutation.isPending ? "Uploading..." : "Post Story"}
            </Button>

            <p className="text-xs text-muted-foreground">
              Stories expire after 24 hours
            </p>
          </div>
        </Card>

        <div className="text-center text-muted-foreground">
          <p>Stories will appear here once posted</p>
        </div>
      </main>
    </div>
  );
}

