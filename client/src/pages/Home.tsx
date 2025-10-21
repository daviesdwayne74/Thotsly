import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="font-black text-white text-lg">T</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">{APP_TITLE}</h1>
          </div>

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
                <Link href="/messages">
                  <a className="text-sm font-semibold hover:text-accent transition">Messages</a>
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            {loading ? (
              <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{user?.name}</span>
                <Button onClick={() => logout()} variant="outline" size="sm">
                  Logout
                </Button>
              </div>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      {isAuthenticated ? (
        <main className="container max-w-6xl mx-auto px-4 py-12">
          <div className="space-y-8">
            <section>
              <h2 className="text-4xl font-black mb-6">Welcome back, {user?.name}!</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/feed">
                  <a className="group p-6 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:shadow-lg transition cursor-pointer">
                    <div className="text-3xl mb-2">📰</div>
                    <h3 className="font-bold text-lg mb-1">Your Feed</h3>
                    <p className="text-sm opacity-90">Discover content from creators you follow</p>
                  </a>
                </Link>

                <Link href="/creators">
                  <a className="group p-6 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-lg transition cursor-pointer">
                    <div className="text-3xl mb-2">👥</div>
                    <h3 className="font-bold text-lg mb-1">Browse Creators</h3>
                    <p className="text-sm opacity-90">Find new creators to support</p>
                  </a>
                </Link>

                <Link href="/dashboard">
                  <a className="group p-6 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 text-white hover:shadow-lg transition cursor-pointer">
                    <div className="text-3xl mb-2">⚙️</div>
                    <h3 className="font-bold text-lg mb-1">Your Dashboard</h3>
                    <p className="text-sm opacity-90">Manage your creator profile</p>
                  </a>
                </Link>
              </div>
            </section>

            <section className="border-t border-border pt-8">
              <h3 className="text-2xl font-black mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-3xl font-black text-accent mb-1">0</p>
                  <p className="text-sm text-muted-foreground">Subscriptions</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-3xl font-black text-accent mb-1">0</p>
                  <p className="text-sm text-muted-foreground">Earnings</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-3xl font-black text-accent mb-1">0</p>
                  <p className="text-sm text-muted-foreground">Messages</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-3xl font-black text-accent mb-1">0</p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
              </div>
            </section>
          </div>
        </main>
      ) : (
        <main className="container max-w-6xl mx-auto px-4 py-20">
          <div className="space-y-12">
            {/* Hero */}
            <section className="text-center space-y-8 py-16">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter">
                The Creator Platform
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                  Built Different
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Connect with your audience. Monetize your content. Support creators you love.
              </p>
            </section>

            {/* Two Path CTA */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12">
              {/* Creator Path */}
              <div className="p-8 rounded-lg border-2 border-blue-500/30 hover:border-blue-500/60 transition bg-gradient-to-br from-blue-500/5 to-blue-600/5">
                <div className="text-5xl mb-4">🎬</div>
                <h3 className="text-2xl font-black mb-3">I'm a Creator</h3>
                <p className="text-muted-foreground mb-6">
                  Build your audience, monetize your content, and keep more of what you earn.
                </p>
                <Button asChild size="lg" className="font-bold w-full">
                  <Link href="/creator-info">
                    <a>Learn More</a>
                  </Link>
                </Button>
              </div>

              {/* Fan Path */}
              <div className="p-8 rounded-lg border-2 border-orange-500/30 hover:border-orange-500/60 transition bg-gradient-to-br from-orange-500/5 to-orange-600/5">
                <div className="text-5xl mb-4">👥</div>
                <h3 className="text-2xl font-black mb-3">Browse Creators</h3>
                <p className="text-muted-foreground mb-6">
                  Discover amazing creators and support the content you love.
                </p>
                <Button asChild size="lg" variant="outline" className="font-bold w-full">
                  <Link href="/creators">
                    <a>Explore Now</a>
                  </Link>
                </Button>
              </div>
            </section>

            {/* General Features */}
            <section className="border-t border-border pt-12">
              <h3 className="text-3xl font-black mb-8 text-center">Why THOTSLY</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-lg border border-border hover:border-accent transition">
                  <div className="text-4xl mb-4">🤝</div>
                  <h4 className="font-black text-lg mb-2">Creator-First</h4>
                  <p className="text-sm text-muted-foreground">Built by creators, for creators. Fair economics and full control.</p>
                </div>

                <div className="p-6 rounded-lg border border-border hover:border-accent transition">
                  <div className="text-4xl mb-4">🔒</div>
                  <h4 className="font-black text-lg mb-2">Secure & Private</h4>
                  <p className="text-sm text-muted-foreground">Your content is protected. Watermarked and screenshot-proof.</p>
                </div>

                <div className="p-6 rounded-lg border border-border hover:border-accent transition">
                  <div className="text-4xl mb-4">⚡</div>
                  <h4 className="font-black text-lg mb-2">Powerful Tools</h4>
                  <p className="text-sm text-muted-foreground">Live streaming, analytics, scheduling, and more.</p>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="text-center py-12 border-t border-border">
              <h3 className="text-2xl font-black mb-4">Ready to get started?</h3>
              <Button asChild size="lg" className="font-bold">
                <a href={getLoginUrl()}>Sign Up Now</a>
              </Button>
            </section>
          </div>
        </main>
      )}
    </div>
  );
}

