import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useRoute } from "wouter";
import Header from "@/components/Header";

export default function LiveStream() {
  const { user } = useAuth();
  const [, params] = useRoute("/stream/:id");
  const streamId = params?.id || "";

  const [message, setMessage] = useState("");
  const [tipAmount, setTipAmount] = useState("");
  const [isLive, setIsLive] = useState(false);

  const { data: stream } = trpc.streaming.getStream.useQuery(
    { id: streamId },
    { enabled: !!streamId }
  );

  const { data: chatMessages } = trpc.streaming.getStreamChat.useQuery(
    { streamId, limit: 50 },
    { enabled: !!streamId }
  );

  const { data: tips } = trpc.streaming.getStreamTips.useQuery(
    { streamId },
    { enabled: !!streamId }
  );

  const sendMessageMutation = trpc.streaming.sendChatMessage.useMutation();
  const sendTipMutation = trpc.streaming.sendTip.useMutation();

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(
      { streamId, message },
      {
        onSuccess: () => setMessage(""),
      }
    );
  };

  const handleSendTip = () => {
    if (!tipAmount || parseFloat(tipAmount) <= 0) return;
    sendTipMutation.mutate(
      {
        streamId,
        amount: parseFloat(tipAmount),
        message: "Support this creator!",
      },
      {
        onSuccess: () => setTipAmount(""),
      }
    );
  };

  if (!stream) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-6xl mx-auto px-4 py-8">
          <p className="text-muted-foreground">Stream not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden bg-black aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-white text-lg mb-2">{stream.title}</p>
                <div className="flex items-center justify-center gap-2">
                  {stream.status === "live" && (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-500 font-bold">LIVE</span>
                      <span className="text-gray-400">{stream.viewerCount} watching</span>
                    </>
                  )}
                  {stream.status === "scheduled" && (
                    <span className="text-gray-400">Scheduled</span>
                  )}
                  {stream.status === "ended" && (
                    <span className="text-gray-400">Stream ended</span>
                  )}
                </div>
              </div>
            </Card>

            {/* Stream Info */}
            <Card className="mt-6 p-6">
              <h1 className="text-3xl font-black mb-2">{stream.title}</h1>
              {stream.description && (
                <p className="text-muted-foreground mb-4">{stream.description}</p>
              )}

              {stream.isPaid && (
                <div className="bg-accent text-accent-foreground px-4 py-2 rounded-lg inline-block font-bold mb-4">
                  PPV: ${(stream.price / 100).toFixed(2)}
                </div>
              )}

              <div className="flex gap-4 text-sm text-muted-foreground">
                <div>
                  <p className="font-bold text-foreground">{stream.totalViewers}</p>
                  <p>Total viewers</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">{Math.floor(stream.duration / 60)}</p>
                  <p>Minutes</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Chat & Tips Sidebar */}
          <div className="space-y-4">
            {/* Tips Section */}
            <Card className="p-4">
              <h3 className="font-black mb-4">Support Creator</h3>
              <div className="space-y-2">
                <Input
                  type="number"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  placeholder="Amount ($)"
                  min="1"
                  step="0.01"
                />
                <Button
                  onClick={handleSendTip}
                  disabled={sendTipMutation.isPending || !tipAmount}
                  className="w-full font-bold"
                >
                  {sendTipMutation.isPending ? "Sending..." : "Send Tip"}
                </Button>
              </div>

              {tips && tips.length > 0 && (
                <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                  <p className="text-xs font-bold text-muted-foreground">Recent Tips</p>
                  {tips.slice(0, 5).map((tip) => (
                    <div key={tip.id} className="text-xs bg-muted p-2 rounded">
                      <p className="font-bold text-accent">${(tip.amount / 100).toFixed(2)}</p>
                      {tip.message && <p className="text-muted-foreground truncate">{tip.message}</p>}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Chat Section */}
            <Card className="p-4 flex flex-col h-96">
              <h3 className="font-black mb-4">Live Chat</h3>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {chatMessages && chatMessages.length > 0 ? (
                  chatMessages.map((msg) => (
                    <div key={msg.id} className="text-xs">
                      <p className="font-bold text-accent">{msg.userId.slice(0, 8)}</p>
                      <p className="text-foreground break-words">{msg.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">No messages yet</p>
                )}
              </div>

              {/* Message Input */}
              {stream.status === "live" && (
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Say something..."
                    className="text-sm"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sendMessageMutation.isPending || !message.trim()}
                    size="sm"
                    className="font-bold"
                  >
                    Send
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

