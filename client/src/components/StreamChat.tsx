import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface StreamChatProps {
  streamId: string;
  creatorName: string;
}

export default function StreamChat({ streamId, creatorName }: StreamChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeUsers, setActiveUsers] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatHistory } = trpc.realtime.getChatHistory.useQuery({
    streamId,
    limit: 50,
  });

  const { data: stats } = trpc.realtime.getStreamStats.useQuery({
    streamId,
  });

  const sendMessageMutation = trpc.realtime.sendMessage.useMutation();
  const joinStreamMutation = trpc.realtime.joinStream.useMutation();

  // Load chat history
  useEffect(() => {
    if (chatHistory) {
      setMessages(chatHistory);
    }
  }, [chatHistory]);

  // Update active users
  useEffect(() => {
    if (stats) {
      setActiveUsers(stats.activeUsers);
    }
  }, [stats]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Join stream on mount
  useEffect(() => {
    joinStreamMutation.mutate({ streamId });
  }, [streamId]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    sendMessageMutation.mutate(
      { streamId, message: newMessage },
      {
        onSuccess: (msg) => {
          setMessages((prev) => [...prev, msg]);
          setNewMessage("");
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-bold">Live Chat</h3>
        <p className="text-xs text-muted-foreground">{activeUsers} watching</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs">
                {msg.isCreator ? (
                  <span className="bg-accent text-accent-foreground px-2 py-1 rounded text-xs">
                    {msg.userName}
                  </span>
                ) : (
                  msg.userName
                )}
              </span>
            </div>
            <p className="text-foreground break-words">{msg.message}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border space-y-2">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            placeholder="Send a message..."
            className="text-sm"
          />
          <Button
            onClick={handleSendMessage}
            disabled={sendMessageMutation.isPending || !newMessage.trim()}
            size="sm"
            className="font-bold"
          >
            Send
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Be respectful. Harassment will result in a ban.
        </p>
      </div>
    </div>
  );
}

