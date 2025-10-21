import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Header() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
      <div className="container max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <a className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="font-black text-primary-foreground text-lg">T</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">{APP_TITLE}</h1>
          </a>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated && (
            <>
              <Link href="/feed">
                <a className="text-sm font-semibold hover:text-accent transition">Feed</a>
              </Link>
              <Link href="/creators">
                <a className="text-sm font-semibold hover:text-accent transition">Creators</a>
              </Link>
              <Link href="/dashboard">
                <a className="text-sm font-semibold hover:text-accent transition">Dashboard</a>
              </Link>
              <Link href="/payout-dashboard">
                <a className="text-sm font-semibold hover:text-accent transition">Payouts</a>
              </Link>
              <Link href="/messages">
                <a className="text-sm font-semibold hover:text-accent transition">Messages</a>
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted transition font-bold text-lg"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {loading ? (
            <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold hidden sm:inline">{user?.name}</span>
              <Button onClick={() => logout()} variant="outline" size="sm" className="font-bold">
                Logout
              </Button>
            </div>
          ) : (
            <Button asChild className="font-bold">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

