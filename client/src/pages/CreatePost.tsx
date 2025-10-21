import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";

export default function CreatePost() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: profile } = trpc.creators.getByUserId.useQuery(
    { userId: user?.id || "" },
    { enabled: !!user?.id }
  );
  const createPostMutation = trpc.content.createPost.useMutation({
    onSuccess: () => {
      setContent("");
      setMediaFiles([]);
      setIsPaid(false);
      setPrice("0");
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      alert("Please add content or media");
      return;
    }

    setIsSubmitting(true);
    try {
      // For now, just create post with text
      // File uploads would go to S3 first
      createPostMutation.mutate({
        content: content || undefined,
        mediaUrls: undefined,
        mediaType: mediaFiles.length > 0 ? "mixed" : "text",
        isPaid,
        price: isPaid ? parseFloat(price) : 0,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">You must be a creator to post</p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Create Post</h1>
          <Link href="/dashboard">
            <Button variant="ghost">Back</Button>
          </Link>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-8">
        <Card className="p-6">
          <div className="space-y-6">
            {/* Creator Info */}
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              {profile.avatarUrl && (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-bold">{profile.displayName}</p>
                <p className="text-sm text-muted-foreground">Posting as creator</p>
              </div>
            </div>

            {/* Content Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Share with your subscribers..."
                className="w-full min-h-32 p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-muted-foreground mt-1">{content.length} characters</p>
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Media</label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-foreground transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="media-input"
                />
                <label htmlFor="media-input" className="cursor-pointer">
                  <p className="font-medium mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG, MP4, WebM (Max 500MB)</p>
                </label>
              </div>
              {mediaFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {mediaFiles.map((file) => (
                    <div key={file.name} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Post Type */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Exclusive/PPV Content</span>
              </label>
              {isPaid && (
                <div>
                  <label className="block text-sm font-medium mb-2">Price ($)</label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || createPostMutation.isPending}
                className="flex-1"
              >
                {isSubmitting || createPostMutation.isPending ? "Publishing..." : "Publish Post"}
              </Button>
              <Button variant="outline" className="flex-1">
                Save as Draft
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

