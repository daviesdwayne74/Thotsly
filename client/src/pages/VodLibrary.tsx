import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";

export default function VodLibrary() {
  const { data: vods, isLoading } = trpc.emailVod.vod.getCreatorVods.useQuery();
  const deleteVodMutation = trpc.emailVod.vod.deleteVod.useMutation();

  const handleDelete = (vodId: string) => {
    if (confirm("Are you sure you want to delete this VOD?")) {
      deleteVodMutation.mutate({ vodId });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black">Stream Recordings</h1>
        </div>

        {!vods || vods.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground">No stream recordings yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your live streams will be automatically saved here
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vods.map((vod) => (
              <Card key={vod.id} className="overflow-hidden hover:shadow-lg transition">
                {vod.thumbnailUrl && (
                  <div className="w-full h-40 bg-muted overflow-hidden">
                    <img
                      src={vod.thumbnailUrl}
                      alt="Stream thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-4 space-y-3">
                  <div>
                    <p className="font-bold text-sm">
                      {vod.duration ? `${Math.floor(vod.duration / 60)} min` : "Unknown duration"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {vod.viewCount} views
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 font-bold text-xs"
                    >
                      {vod.isPublic ? "Public" : "Private"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(vod.id)}
                      disabled={deleteVodMutation.isPending}
                      className="font-bold text-xs"
                    >
                      Delete
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {vod.createdAt ? new Date(vod.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

