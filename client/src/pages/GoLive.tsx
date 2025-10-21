import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import Header from "@/components/Header";

export default function GoLive() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [activeStream, setActiveStream] = useState<any>(null);

  const { data: streams } = trpc.streaming.getCreatorStreams.useQuery();
  const createMutation = trpc.streaming.create.useMutation();
  const startMutation = trpc.streaming.startStream.useMutation();
  const endMutation = trpc.streaming.endStream.useMutation();

  const handleCreateStream = () => {
    if (!title.trim()) return;

    createMutation.mutate(
      {
        title,
        description,
        isPaid,
        price: isPaid ? parseFloat(price) : 0,
        isPrivate,
      },
      {
        onSuccess: (data) => {
          setActiveStream(data);
          setTitle("");
          setDescription("");
          setPrice("");
        },
      }
    );
  };

  const handleStartStream = (streamId: string) => {
    startMutation.mutate({ streamId });
  };

  const handleEndStream = (streamId: string) => {
    endMutation.mutate({ streamId });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-black mb-8">Go Live</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stream Creation */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h2 className="text-2xl font-black mb-6">Create New Stream</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Stream Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What are you streaming?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Description</label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell viewers what to expect"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                    />
                    <span className="text-sm font-bold">Private Stream</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPaid}
                      onChange={(e) => setIsPaid(e.target.checked)}
                    />
                    <span className="text-sm font-bold">PPV Stream</span>
                  </label>
                </div>

                {isPaid && (
                  <div>
                    <label className="block text-sm font-bold mb-2">Price ($)</label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="9.99"
                      step="0.01"
                      min="0.99"
                    />
                  </div>
                )}

                <Button
                  onClick={handleCreateStream}
                  disabled={createMutation.isPending || !title.trim()}
                  className="w-full font-bold text-lg py-6"
                >
                  {createMutation.isPending ? "Creating..." : "Create Stream"}
                </Button>

                {activeStream && (
                  <Card className="p-4 bg-accent text-accent-foreground">
                    <p className="font-bold mb-2">Stream Created!</p>
                    <p className="text-sm mb-4">Stream Key: {activeStream.streamKey}</p>
                    <p className="text-xs">Use this key in your streaming software (OBS, etc.)</p>
                  </Card>
                )}
              </div>
            </Card>
          </div>

          {/* Active Streams */}
          <div>
            <Card className="p-6">
              <h3 className="text-xl font-black mb-4">Your Streams</h3>

              {streams && streams.length > 0 ? (
                <div className="space-y-3">
                  {streams.map((stream) => (
                    <div key={stream.id} className="p-3 bg-muted rounded-lg">
                      <p className="font-bold text-sm mb-2 line-clamp-2">{stream.title}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${
                            stream.status === "live"
                              ? "bg-red-500 text-white"
                              : stream.status === "scheduled"
                              ? "bg-yellow-500 text-black"
                              : "bg-gray-500 text-white"
                          }`}
                        >
                          {stream.status.toUpperCase()}
                        </span>
                        {stream.status === "live" && (
                          <span className="text-xs text-muted-foreground">
                            {stream.viewerCount} watching
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {stream.status === "scheduled" && (
                          <Button
                            onClick={() => handleStartStream(stream.id)}
                            disabled={startMutation.isPending}
                            size="sm"
                            className="flex-1 font-bold"
                          >
                            Start
                          </Button>
                        )}
                        {stream.status === "live" && (
                          <Button
                            onClick={() => handleEndStream(stream.id)}
                            disabled={endMutation.isPending}
                            variant="destructive"
                            size="sm"
                            className="flex-1 font-bold"
                          >
                            End
                          </Button>
                        )}
                        {stream.status === "ended" && (
                          <Link href={`/stream/${stream.id}`}>
                            <Button size="sm" variant="outline" className="flex-1 font-bold">
                              View
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No streams yet</p>
              )}
            </Card>

            {/* Tips */}
            <Card className="p-6 mt-4 bg-blue-50 dark:bg-blue-950">
              <h4 className="font-black text-sm mb-2">Streaming Tips</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Use OBS or similar software</li>
                <li>• Test your internet speed</li>
                <li>• Have good lighting</li>
                <li>• Engage with chat</li>
                <li>• Schedule streams in advance</li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

