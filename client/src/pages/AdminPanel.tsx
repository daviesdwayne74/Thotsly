import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import Header from "@/components/Header";

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "content" | "users" | "creators" | "flags">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stats } = trpc.admin.getStats.useQuery();
  const { data: users } = trpc.admin.listUsers.useQuery({ limit: 100 });
  const { data: creators } = trpc.admin.listCreators.useQuery({ limit: 100 });
  const { data: flags } = trpc.features.moderation.getPendingFlags.useQuery();

  const reviewFlagMutation = trpc.features.moderation.reviewFlag.useMutation();

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Admin access required</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleApproveFlag = (flagId: string) => {
    reviewFlagMutation.mutate({
      flagId,
      approved: true,
      action: "warning",
    });
  };

  const handleRejectFlag = (flagId: string) => {
    reviewFlagMutation.mutate({
      flagId,
      approved: false,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform moderation and management</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "content", label: "Content" },
            { id: "users", label: "Users" },
            { id: "creators", label: "Creators" },
            { id: "flags", label: "Flagged Content" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Users</p>
              <p className="text-3xl font-black">{stats?.totalUsers || 0}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Active Creators</p>
              <p className="text-3xl font-black">{stats?.totalCreators || 0}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Posts</p>
              <p className="text-3xl font-black">{stats?.totalPosts || 0}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Platform Earnings</p>
              <p className="text-3xl font-black">${((stats?.totalEarnings || 0) / 100).toFixed(2)}</p>
            </Card>
          </div>
        )}

        {/* CONTENT TAB */}
        {activeTab === "content" && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-black mb-4">Content Management</h2>
              <div className="space-y-4">
                <Input
                  placeholder="Search posts by creator or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="text-center text-muted-foreground py-8">
                  <p>All platform content visible here</p>
                  <p className="text-sm">Posts, stories, and streams can be reviewed and removed</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-black mb-4">User Management</h2>
              <div className="space-y-4">
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {users && users.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border">
                        <tr>
                          <th className="text-left py-2 font-bold">User</th>
                          <th className="text-left py-2 font-bold">Email</th>
                          <th className="text-left py-2 font-bold">Role</th>
                          <th className="text-left py-2 font-bold">Joined</th>
                          <th className="text-left py-2 font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 font-medium">{u.name || "Unknown"}</td>
                            <td className="py-3 text-muted-foreground">{u.email}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                u.role === "admin" ? "bg-red-500 text-white" : "bg-muted"
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 text-muted-foreground text-xs">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="py-3">
                              <Button size="sm" variant="outline" className="text-xs">
                                Review
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No users found</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* CREATORS TAB */}
        {activeTab === "creators" && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-black mb-4">Creator Management</h2>
              <div className="space-y-4">
                <Input
                  placeholder="Search creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {creators && creators.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {creators.map((creator) => (
                      <Card key={creator.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-bold">{creator.displayName}</p>
                            <p className="text-xs text-muted-foreground">{creator.totalSubscribers} subscribers</p>
                          </div>
                          {creator.isVerified && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded font-bold">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{creator.bio}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 text-xs">
                            Verify
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 text-xs">
                            Suspend
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No creators found</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* FLAGS TAB */}
        {activeTab === "flags" && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-black mb-4">Flagged Content</h2>
              {flags && flags.length > 0 ? (
                <div className="space-y-4">
                  {flags.map((flag) => (
                    <Card key={flag.id} className="p-4 border-l-4 border-l-yellow-500">
                      <div className="mb-3">
                        <p className="font-bold mb-1">
                          {flag.postId ? "Post" : "Stream"} - {flag.reason.toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">{flag.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveFlag(flag.id)}
                          disabled={reviewFlagMutation.isPending}
                          className="flex-1 text-xs font-bold"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectFlag(flag.id)}
                          disabled={reviewFlagMutation.isPending}
                          className="flex-1 text-xs font-bold"
                        >
                          Reject
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No flagged content</p>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

