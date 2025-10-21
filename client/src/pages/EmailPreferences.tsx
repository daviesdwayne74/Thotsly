import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";

export default function EmailPreferences() {
  const { data: prefs, isLoading } = trpc.emailVod.email.getPreferences.useQuery();
  const updateMutation = trpc.emailVod.email.updatePreferences.useMutation();

  const [settings, setSettings] = useState({
    newSubscriber: prefs?.newSubscriber ?? true,
    newMessage: prefs?.newMessage ?? true,
    newTip: prefs?.newTip ?? true,
    streamNotification: prefs?.streamNotification ?? true,
    weeklyDigest: prefs?.weeklyDigest ?? true,
    promotionalEmails: prefs?.promotionalEmails ?? false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-black mb-8">Email Preferences</h1>

        <Card className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-bold">New Subscribers</p>
                <p className="text-sm text-muted-foreground">Notify when someone subscribes</p>
              </div>
              <input
                type="checkbox"
                checked={settings.newSubscriber}
                onChange={() => handleToggle("newSubscriber")}
                className="w-5 h-5"
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-bold">New Messages</p>
                <p className="text-sm text-muted-foreground">Notify when you receive messages</p>
              </div>
              <input
                type="checkbox"
                checked={settings.newMessage}
                onChange={() => handleToggle("newMessage")}
                className="w-5 h-5"
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-bold">New Tips</p>
                <p className="text-sm text-muted-foreground">Notify when you receive tips</p>
              </div>
              <input
                type="checkbox"
                checked={settings.newTip}
                onChange={() => handleToggle("newTip")}
                className="w-5 h-5"
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-bold">Stream Notifications</p>
                <p className="text-sm text-muted-foreground">Notify when followed creators go live</p>
              </div>
              <input
                type="checkbox"
                checked={settings.streamNotification}
                onChange={() => handleToggle("streamNotification")}
                className="w-5 h-5"
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-bold">Weekly Digest</p>
                <p className="text-sm text-muted-foreground">Get weekly summary of activity</p>
              </div>
              <input
                type="checkbox"
                checked={settings.weeklyDigest}
                onChange={() => handleToggle("weeklyDigest")}
                className="w-5 h-5"
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-bold">Promotional Emails</p>
                <p className="text-sm text-muted-foreground">Receive platform updates and promotions</p>
              </div>
              <input
                type="checkbox"
                checked={settings.promotionalEmails}
                onChange={() => handleToggle("promotionalEmails")}
                className="w-5 h-5"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="w-full font-bold text-lg py-6"
          >
            {updateMutation.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </Card>
      </main>
    </div>
  );
}

