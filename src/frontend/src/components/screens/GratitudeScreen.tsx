import { useState } from "react";
import { PaymentModal } from "../PaymentModal";
import { StarField } from "../StarField";

interface GratitudeScreenProps {
  onBadgeUnlock: (icon: "star" | "heart" | "angel") => void;
  badges: Set<"star" | "heart" | "angel">;
  requireAuth: () => boolean;
}

export function GratitudeScreen({
  onBadgeUnlock,
  badges,
  requireAuth,
}: GratitudeScreenProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<
    "star" | "heart" | "angel" | null
  >(null);
  const [justUnlocked, setJustUnlocked] = useState<string | null>(null);

  function openModal(icon: "star" | "heart" | "angel") {
    if (!requireAuth()) return;
    setSelectedIcon(icon);
    setModalOpen(true);
  }

  function handleActivate(icon: "star" | "heart" | "angel") {
    onBadgeUnlock(icon);
    setJustUnlocked(icon);
    setTimeout(() => setJustUnlocked(null), 3000);
  }

  const ICONS: {
    key: "star" | "heart" | "angel";
    emoji: string;
    label: string;
  }[] = [
    { key: "star", emoji: "⭐", label: "Star Energy" },
    { key: "heart", emoji: "❤️", label: "Heart Energy" },
    { key: "angel", emoji: "😇", label: "Angel Energy" },
  ];

  return (
    <>
      <div className="flex flex-col h-full relative overflow-hidden">
        <StarField count={80} />

        {/* Nebula radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 40%, oklch(0.26 0.1 291 / 0.35) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 py-10 gap-12">
          {/* Affirmation text */}
          <div className="text-center space-y-3">
            <p
              className="text-3xl font-bold leading-snug glow-text"
              style={{ color: "oklch(0.92 0.06 291)" }}
            >
              I attain my dream ✨
            </p>
            <p
              className="text-2xl font-semibold"
              style={{
                color: "oklch(0.85 0.08 291)",
                textShadow: "0 0 20px oklch(0.55 0.2 291 / 0.5)",
              }}
            >
              I'm blessed 🙏
            </p>
            <p
              className="text-2xl font-semibold"
              style={{
                color: "oklch(0.85 0.06 271)",
                textShadow: "0 0 20px oklch(0.55 0.2 291 / 0.4)",
              }}
            >
              Everything is flowing with ease 🌙
            </p>
          </div>

          {/* Decorative stars */}
          <div className="flex gap-2">
            {(["✨", "🌙", "🌟"] as string[]).map((s, idx) => (
              <span
                key={s}
                className="text-2xl star"
                style={
                  {
                    "--duration": `${2.5 + idx * 0.5}s`,
                    "--delay": `${idx * 0.7}s`,
                  } as React.CSSProperties
                }
              >
                {s}
              </span>
            ))}
          </div>

          {/* Energy icons */}
          <div className="space-y-4 w-full">
            <p
              className="text-center text-sm font-semibold"
              style={{ color: "oklch(0.62 0.04 271)" }}
            >
              Choose your energy to unlock a badge
            </p>
            <div className="flex justify-center gap-5">
              {ICONS.map(({ key, emoji, label }) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => openModal(key)}
                  className="flex flex-col items-center gap-2 transition-all duration-300"
                  style={{
                    transform: badges.has(key) ? "scale(1.1)" : "scale(1)",
                  }}
                  data-ocid="gratitude.open_modal_button"
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-all duration-300"
                    style={{
                      background: badges.has(key)
                        ? "linear-gradient(135deg, oklch(0.47 0.2 291 / 0.4), oklch(0.68 0.17 291 / 0.3))"
                        : "oklch(0.96 0.01 291 / 0.07)",
                      border: badges.has(key)
                        ? "2px solid oklch(0.72 0.16 291 / 0.7)"
                        : "1px solid oklch(0.96 0.01 291 / 0.15)",
                      boxShadow: badges.has(key)
                        ? "0 0 24px oklch(0.55 0.2 291 / 0.5), 0 0 48px oklch(0.55 0.2 291 / 0.2)"
                        : "none",
                    }}
                  >
                    {emoji}
                  </div>
                  <span
                    className="text-xs font-semibold"
                    style={{
                      color: badges.has(key)
                        ? "oklch(0.72 0.16 291)"
                        : "oklch(0.62 0.04 271)",
                    }}
                  >
                    {badges.has(key) ? "Activated ✓" : label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Unlock notification */}
          {justUnlocked && (
            <div className="glass-card-glow rounded-2xl px-6 py-3 text-center slide-up">
              <p
                className="text-sm font-semibold"
                style={{ color: "oklch(0.72 0.16 291)" }}
              >
                {justUnlocked === "star"
                  ? "⭐"
                  : justUnlocked === "heart"
                    ? "❤️"
                    : "😇"}{" "}
                Energy badge unlocked! ✨
              </p>
            </div>
          )}
        </div>
      </div>

      <PaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        icon={selectedIcon}
        onActivate={handleActivate}
      />
    </>
  );
}
