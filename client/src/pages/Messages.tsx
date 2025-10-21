import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";

export default function Messages() {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");

  const { data: conversations } = trpc.messaging.getConversations.useQuery();
  const { data: conversation } = trpc.messaging.getConversation.useQuery(
    { userId: selectedUserId || "" },
    { enabled: !!selectedUserId }
  );

  const sendMutation = trpc.messaging.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
    },
  });

  const handleSend = () => {
    if (!selectedUserId || !messageText.trim()) return;
    sendMutation.mutate({
      recipientId: selectedUserId,
      content: messageText,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-black mb-8">Messages</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-96">
          <Card className="p-4 overflow-y-auto">
            <h2 className="font-bold mb-4">Conversations</h2>
            {conversations && conversations.length > 0 ? (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedUserId(conv.senderId === user?.id ? conv.recipientId : conv.senderId)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedUserId === (conv.senderId === user?.id ? conv.recipientId : conv.senderId)
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <p className="font-bold text-sm">{conv.senderId === user?.id ? conv.recipientId : conv.senderId}</p>
                    <p className="text-xs text-muted-foreground truncate">{conv.content}</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No conversations</p>
            )}
          </Card>

          {selectedUserId ? (
            <Card className="md:col-span-2 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {conversation && conversation.length > 0 ? (
                  conversation.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                          msg.senderId === user?.id ? "bg-accent text-accent-foreground" : "bg-muted"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8 text-sm">No messages</p>
                )}
              </div>
              <div className="border-t border-border p-4 flex gap-2">
                <Input value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSend()} placeholder="Type..." />
                <Button onClick={handleSend} disabled={!messageText.trim()} size="sm" className="font-bold">Send</Button>
              </div>
            </Card>
          ) : (
            <Card className="md:col-span-2 flex items-center justify-center">
              <p className="text-muted-foreground">Select a conversation</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
