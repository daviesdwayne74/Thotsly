import { trpc } from "@/lib/trpc";

interface BadgeDisplayProps {
  monthlyEarnings: number;
  subscriptionRate: number;
  isVerified: boolean;
  isEliteFounder: boolean;
}

export default function BadgeDisplay({
  monthlyEarnings,
  subscriptionRate,
  isVerified,
  isEliteFounder,
}: BadgeDisplayProps) {
  const { data: badges } = trpc.badges.getCreatorBadges.useQuery({
    monthlyEarnings,
    subscriptionRate,
    isVerified,
    isEliteFounder,
  });

  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/10 border border-accent/20"
          title={badge.description}
        >
          <span className="text-lg">{badge.icon}</span>
          <span className="text-sm font-bold text-accent">{badge.name}</span>
        </div>
      ))}
    </div>
  );
}

