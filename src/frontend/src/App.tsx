import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { StarField } from "./components/StarField";
import { AttainmentScreen } from "./components/screens/AttainmentScreen";
import { DreamScreen } from "./components/screens/DreamScreen";
import { ExperienceScreen } from "./components/screens/ExperienceScreen";
import { GratitudeScreen } from "./components/screens/GratitudeScreen";
import { ProfileScreen } from "./components/screens/ProfileScreen";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

type Tab = "dream" | "experience" | "attainment" | "profile" | "gratitude";

const TABS: { id: Tab; emoji: string; label: string }[] = [
  { id: "dream", emoji: "🌙", label: "Dream" },
  { id: "experience", emoji: "🎥", label: "Experience" },
  { id: "attainment", emoji: "✅", label: "Attainment" },
  { id: "profile", emoji: "👤", label: "Profile" },
  { id: "gratitude", emoji: "🙏", label: "Gratitude" },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dream");
  const [badges, setBadges] = useState<Set<"star" | "heart" | "angel">>(
    new Set(),
  );
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const { login, loginStatus, identity, isInitializing } =
    useInternetIdentity();

  const isLoggedIn = !!identity;

  function requireAuth(): boolean {
    if (isLoggedIn) return true;
    setShowAuthPrompt(true);
    return false;
  }

  function handleBadgeUnlock(icon: "star" | "heart" | "angel") {
    setBadges((prev) => new Set([...prev, icon]));
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div
        className="dream-bg min-h-dvh flex flex-col items-center justify-start"
        style={{ overscrollBehavior: "contain" }}
      >
        {/* Global starfield */}
        <div className="fixed inset-0 pointer-events-none">
          <StarField count={60} />
          {/* Ambient glows */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, oklch(0.26 0.1 291 / 0.2) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div
            className="absolute bottom-20 right-0 w-60 h-60 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, oklch(0.26 0.1 264 / 0.15) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </div>

        {/* Mobile container */}
        <div className="relative w-full max-w-[430px] min-h-dvh flex flex-col">
          {/* Main content */}
          <main
            className="flex-1 overflow-hidden"
            style={{ paddingBottom: "80px" }}
          >
            <div className="h-[calc(100dvh-80px)] overflow-y-auto">
              {activeTab === "dream" && (
                <DreamScreen requireAuth={requireAuth} />
              )}
              {activeTab === "experience" && (
                <ExperienceScreen requireAuth={requireAuth} />
              )}
              {activeTab === "attainment" && (
                <AttainmentScreen requireAuth={requireAuth} />
              )}
              {activeTab === "profile" && (
                <ProfileScreen badges={badges} requireAuth={requireAuth} />
              )}
              {activeTab === "gratitude" && (
                <GratitudeScreen
                  onBadgeUnlock={handleBadgeUnlock}
                  badges={badges}
                  requireAuth={requireAuth}
                />
              )}
            </div>
          </main>

          {/* Bottom nav */}
          <nav
            className="bottom-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-2 pb-safe"
            style={{ zIndex: 50 }}
          >
            <div className="flex items-center justify-around py-2">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-2xl transition-all duration-300 min-w-[60px]"
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, oklch(0.47 0.2 291 / 0.25), oklch(0.68 0.17 291 / 0.15))"
                        : "transparent",
                      boxShadow: isActive
                        ? "0 0 16px oklch(0.55 0.2 291 / 0.3)"
                        : "none",
                      border: isActive
                        ? "1px solid oklch(0.72 0.16 291 / 0.3)"
                        : "1px solid transparent",
                    }}
                    data-ocid={`nav.${tab.id}.link`}
                  >
                    <span
                      className="text-xl transition-all duration-300"
                      style={{
                        transform: isActive ? "scale(1.15)" : "scale(1)",
                      }}
                    >
                      {tab.emoji}
                    </span>
                    <span
                      className="text-[10px] font-semibold transition-all duration-300"
                      style={{
                        color: isActive
                          ? "oklch(0.82 0.12 291)"
                          : "oklch(0.5 0.03 271)",
                      }}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Auth Prompt Overlay */}
        {showAuthPrompt && (
          <div
            className="fixed inset-0 flex items-end justify-center"
            style={{
              zIndex: 100,
              background: "oklch(0.08 0.018 264 / 0.85)",
              backdropFilter: "blur(8px)",
            }}
            role="presentation"
            data-ocid="auth.modal"
          >
            <div
              className="w-full max-w-[430px] glass-card-glow rounded-t-3xl p-8 pb-12 space-y-5 slide-up"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <p className="text-4xl mb-3">🌙</p>
                <h2 className="text-2xl font-bold text-foreground">
                  Begin Your Journey
                </h2>
                <p
                  className="text-sm mt-2"
                  style={{ color: "oklch(0.62 0.04 271)" }}
                >
                  Sign in to manifest your dreams and connect with the universe
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAuthPrompt(false);
                  login();
                }}
                disabled={loginStatus === "logging-in"}
                className="gradient-btn w-full text-white font-bold rounded-full py-4 text-base border-0 transition-all"
                data-ocid="auth.primary_button"
              >
                {loginStatus === "logging-in" ? "Connecting..." : "Sign In ✨"}
              </button>
              <button
                type="button"
                onClick={() => setShowAuthPrompt(false)}
                className="w-full text-center text-sm py-2 opacity-50 hover:opacity-100 transition-opacity"
                style={{ color: "oklch(0.62 0.04 271)" }}
                data-ocid="auth.cancel_button"
              >
                Maybe Later
              </button>
            </div>
          </div>
        )}

        {/* Login banner if not authenticated */}
        {!isLoggedIn && !isInitializing && !showAuthPrompt && (
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 pt-3 z-40">
            <div className="glass-card rounded-2xl px-4 py-2.5 flex items-center justify-between">
              <p className="text-xs" style={{ color: "oklch(0.72 0.16 291)" }}>
                ✨ Sign in to manifest
              </p>
              <button
                type="button"
                onClick={() => {
                  login();
                }}
                className="gradient-btn text-white text-xs font-bold rounded-full px-3 py-1.5 border-0"
                data-ocid="auth.secondary_button"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>

      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
