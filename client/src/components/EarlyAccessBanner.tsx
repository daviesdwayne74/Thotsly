import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EarlyAccessBanner() {
  const [isVisible, setIsVisible] = useState(true);
  
  // Elite Founding: 10 spots total
  const totalSpots = 10;
  const filledSpots = 2; // This would come from database in production
  const remainingSpots = totalSpots - filledSpots;

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-accent to-orange-600 text-white py-4 px-4">
      <div className="container max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-black text-lg mb-1">🚀 Early Access</h3>
          <p className="text-sm">
            THOTSLY is in Early Access. Elite Founding Creators get 10% platform fee locked for life.{" "}
            <span className="font-bold">
              {remainingSpots} of {totalSpots} spots remaining
            </span>
            {" "}
            <a href="/elite-program" className="underline font-bold hover:opacity-80">
              Learn more
            </a>
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="text-white hover:bg-white/20"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

