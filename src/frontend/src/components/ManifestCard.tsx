import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import type { Blessing, Manifest } from "../backend.d";
import { EnergyReaction } from "../backend.d";

interface ManifestCardProps {
  manifest: Manifest & {
    id: bigint;
    username: string;
    timestamp?: string;
    isMock?: boolean;
  };
  onBoost?: (id: bigint) => Promise<void>;
  onBless?: (id: bigint, msg: string) => Promise<Blessing | undefined>;
  onReact?: (id: bigint, reaction: EnergyReaction) => Promise<void>;
  index?: number;
  showSayOnly?: boolean;
  requireAuth?: () => boolean;
}

interface LocalBlessing extends Blessing {
  localId: string;
}

const AVATAR_COLORS = [
  "linear-gradient(135deg, oklch(0.47 0.2 291), oklch(0.68 0.17 291))",
  "linear-gradient(135deg, oklch(0.38 0.12 264), oklch(0.55 0.2 291))",
  "linear-gradient(135deg, oklch(0.55 0.2 291), oklch(0.82 0.12 291))",
  "linear-gradient(135deg, oklch(0.3 0.1 264), oklch(0.47 0.2 291))",
  "linear-gradient(135deg, oklch(0.46 0.18 291), oklch(0.72 0.16 291))",
];

function shortenSender(sender: any): string {
  try {
    const s = sender?.toString?.() ?? String(sender);
    return s.length > 8 ? `${s.slice(0, 8)}...` : s;
  } catch {
    return "Dreamer";
  }
}

export function ManifestCard({
  manifest,
  onBoost,
  onBless,
  onReact,
  index = 0,
  showSayOnly = false,
  requireAuth,
}: ManifestCardProps) {
  const [boosted, setBoosted] = useState(false);
  const [boostCount, setBoostCount] = useState(Number(manifest.boostCount));
  const [blessingOpen, setBlessingOpen] = useState(false);
  const [blessingText, setBlessingText] = useState("");
  const [blessingLoading, setBlessingLoading] = useState(false);
  const [boostLoading, setBoostLoading] = useState(false);
  const [localBlessings, setLocalBlessings] = useState<LocalBlessing[]>(
    manifest.blessings.map((b, i) => ({ ...b, localId: `init-${i}` })),
  );
  const [reactions, setReactions] = useState<Set<EnergyReaction>>(new Set());
  const [boostAnimate, setBoostAnimate] = useState(false);
  const [sendAnimate, setSendAnimate] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [boostMsg, setBoostMsg] = useState("");

  const avatarGrad = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initials = manifest.username.slice(0, 2).toUpperCase();

  function checkAuth(): boolean {
    if (!requireAuth) return true;
    const ok = requireAuth();
    if (!ok) return false;
    return true;
  }

  async function handleBoost() {
    if (!checkAuth()) return;
    if (boosted || boostLoading) return;

    setBoosted(true);
    setBoostCount((c) => c + 1);
    setBoostAnimate(true);
    setBoostLoading(true);
    setTimeout(() => setBoostAnimate(false), 400);

    if (manifest.isMock || !onBoost) {
      setBoostMsg("Boost added ⚡");
      setTimeout(() => setBoostMsg(""), 2500);
      setBoostLoading(false);
      return;
    }

    try {
      await onBoost(manifest.id);
      setBoostMsg("Boost added ⚡");
      setTimeout(() => setBoostMsg(""), 2500);
    } catch (err: unknown) {
      setBoosted(false);
      setBoostCount((c) => c - 1);
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("Unauthorized") || msg.includes("user")) {
        setBoostMsg("Please sign in first ✨");
      } else {
        setBoostMsg("Could not boost, try again");
      }
      setTimeout(() => setBoostMsg(""), 2500);
    } finally {
      setBoostLoading(false);
    }
  }

  async function handleBlessing() {
    if (!checkAuth()) return;

    if (!blessingText.trim()) {
      setValidationMsg("Write a blessing first 💫");
      return;
    }

    setBlessingLoading(true);
    setSendAnimate(true);
    setTimeout(() => setSendAnimate(false), 400);

    const localId = `b-${Date.now()}`;
    const optimisticBlessing: LocalBlessing = {
      blessing: blessingText.trim(),
      sender: "You" as any,
      localId,
    };

    if (manifest.isMock || !onBless) {
      setLocalBlessings((prev) => [...prev, optimisticBlessing]);
      setBlessingText("");
      setSuccessMsg("Blessing sent ✨");
      setValidationMsg("");
      setTimeout(() => setSuccessMsg(""), 2500);
      setBlessingLoading(false);
      return;
    }

    try {
      const result = await onBless(manifest.id, blessingText.trim());
      const newBlessing: LocalBlessing = result
        ? { ...result, localId }
        : optimisticBlessing;
      setLocalBlessings((prev) => [...prev, newBlessing]);
      setBlessingText("");
      setSuccessMsg("Blessing sent ✨");
      setValidationMsg("");
      setTimeout(() => setSuccessMsg(""), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("Unauthorized") || msg.includes("user")) {
        setValidationMsg("Please sign in first ✨");
      } else if (msg.includes("not found")) {
        setLocalBlessings((prev) => [...prev, optimisticBlessing]);
        setBlessingText("");
        setSuccessMsg("Blessing sent ✨");
        setValidationMsg("");
        setTimeout(() => setSuccessMsg(""), 2500);
      } else {
        setValidationMsg("Something went wrong, try again");
      }
    } finally {
      setBlessingLoading(false);
    }
  }

  async function handleReact(type: EnergyReaction) {
    if (!checkAuth()) return;
    const next = new Set(reactions);
    if (next.has(type)) {
      next.delete(type);
      setReactions(next);
      return;
    }
    next.add(type);
    setReactions(next);

    if (manifest.isMock || !onReact) return;

    try {
      await onReact(manifest.id, type);
    } catch {
      // Silently keep local state
    }
  }

  function handleBlessingToggle() {
    if (!blessingOpen && requireAuth) {
      if (!requireAuth()) return;
    }
    setBlessingOpen((v) => !v);
  }

  const showBlessedSection =
    !showSayOnly && (blessingOpen || localBlessings.length > 0);

  return (
    <div
      className="glass-card rounded-3xl p-5 space-y-4 slide-up"
      style={{ animationDelay: `${index * 0.08}s` }}
      data-ocid={`manifest.item.${index + 1}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: avatarGrad }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">
            {manifest.username}
          </p>
          {manifest.timestamp && (
            <p className="text-xs" style={{ color: "oklch(0.62 0.04 271)" }}>
              {manifest.timestamp}
            </p>
          )}
        </div>
        {manifest.isAttained && (
          <span
            className="ml-auto text-xs px-2 py-1 rounded-full font-semibold shrink-0"
            style={{
              background: "oklch(0.47 0.2 291 / 0.2)",
              color: "oklch(0.72 0.16 291)",
              border: "1px solid oklch(0.72 0.16 291 / 0.3)",
            }}
          >
            Manifested ✅
          </span>
        )}
      </div>

      {/* Dream text */}
      <p
        className="text-sm leading-relaxed"
        style={{ color: "oklch(0.85 0.04 271)" }}
      >
        {manifest.description || manifest.title}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {!showSayOnly && (
          <button
            type="button"
            onClick={handleBoost}
            disabled={boosted || boostLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${boostAnimate ? "boost-pop" : ""}`}
            style={{
              background: boosted
                ? "oklch(0.47 0.2 291 / 0.25)"
                : "oklch(0.96 0.01 291 / 0.07)",
              border: boosted
                ? "1px solid oklch(0.72 0.16 291 / 0.5)"
                : "1px solid oklch(0.96 0.01 291 / 0.12)",
              color: boosted ? "oklch(0.72 0.16 291)" : "oklch(0.77 0.03 271)",
              opacity: boostLoading ? 0.7 : 1,
            }}
            data-ocid={`manifest.toggle.${index + 1}`}
          >
            ⚡ {boostLoading ? "..." : boostCount > 0 ? boostCount : "Boost"}
          </button>
        )}

        <button
          type="button"
          onClick={handleBlessingToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200"
          style={{
            background: blessingOpen
              ? "oklch(0.47 0.2 291 / 0.25)"
              : "oklch(0.96 0.01 291 / 0.07)",
            border: blessingOpen
              ? "1px solid oklch(0.72 0.16 291 / 0.5)"
              : "1px solid oklch(0.96 0.01 291 / 0.12)",
            color: blessingOpen
              ? "oklch(0.72 0.16 291)"
              : "oklch(0.77 0.03 271)",
          }}
          data-ocid={`manifest.${showSayOnly ? "say" : "bless"}_button.${index + 1}`}
        >
          {showSayOnly ? "💬 Say" : `💫 Blessings (${localBlessings.length})`}
        </button>

        {!showSayOnly && (
          <div className="flex items-center gap-1 ml-auto">
            {(
              [
                [EnergyReaction.star, "⭐"],
                [EnergyReaction.heart, "❤️"],
                [EnergyReaction.angelBadge, "😇"],
              ] as [EnergyReaction, string][]
            ).map(([type, emoji]) => (
              <button
                type="button"
                key={type}
                onClick={() => handleReact(type)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-base transition-all duration-200"
                style={{
                  background: reactions.has(type)
                    ? "oklch(0.47 0.2 291 / 0.3)"
                    : "oklch(0.96 0.01 291 / 0.07)",
                  border: reactions.has(type)
                    ? "1px solid oklch(0.72 0.16 291 / 0.5)"
                    : "1px solid oklch(0.96 0.01 291 / 0.1)",
                  transform: reactions.has(type) ? "scale(1.15)" : "scale(1)",
                }}
                data-ocid={`manifest.toggle.${index + 1}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Boost feedback */}
      {boostMsg && (
        <p className="text-xs" style={{ color: "oklch(0.72 0.16 291)" }}>
          {boostMsg}
        </p>
      )}

      {/* Blessing input */}
      {blessingOpen && (
        <div className="space-y-2 slide-up">
          <Textarea
            value={blessingText}
            onChange={(e) => {
              setBlessingText(e.target.value);
              setValidationMsg("");
            }}
            placeholder="Send a blessing into the universe..."
            className="bg-transparent border rounded-2xl text-sm resize-none min-h-[80px] placeholder:text-muted-foreground focus:ring-1"
            style={{
              borderColor: "oklch(0.96 0.01 291 / 0.2)",
              color: "oklch(0.85 0.04 271)",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleBlessing();
              }
            }}
            data-ocid={`manifest.textarea.${index + 1}`}
          />
          {validationMsg && (
            <p className="text-xs" style={{ color: "oklch(0.72 0.16 291)" }}>
              {validationMsg}
            </p>
          )}
          {successMsg && (
            <p className="text-xs" style={{ color: "oklch(0.72 0.16 291)" }}>
              {successMsg}
            </p>
          )}
          <Button
            size="sm"
            onClick={handleBlessing}
            disabled={blessingLoading}
            className="gradient-btn text-white border-0 rounded-full px-4 text-sm"
            style={
              sendAnimate
                ? {
                    boxShadow: "0 0 18px oklch(0.72 0.16 291 / 0.8)",
                    transform: "scale(1.08)",
                    transition: "all 0.2s",
                  }
                : {}
            }
            data-ocid={`manifest.submit_button.${index + 1}`}
          >
            {blessingLoading ? "Sending..." : "Send 💫"}
          </Button>
        </div>
      )}

      {/* Blessed 💫 section */}
      {showBlessedSection && localBlessings.length > 0 && (
        <div className="space-y-2 slide-up">
          <p
            className="text-sm font-semibold"
            style={{
              color: "oklch(0.72 0.16 291)",
              textShadow: "0 0 10px oklch(0.72 0.16 291 / 0.5)",
            }}
          >
            Blessed 💫
          </p>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
            {localBlessings.map((b) => (
              <div
                key={b.localId}
                className="rounded-2xl p-3"
                style={{
                  background: "oklch(0.96 0.01 291 / 0.05)",
                  border: "1px solid oklch(0.96 0.01 291 / 0.1)",
                }}
              >
                <p
                  className="text-xs font-semibold mb-0.5"
                  style={{ color: "oklch(0.72 0.16 291)" }}
                >
                  {shortenSender(b.sender)}
                </p>
                <p
                  className="text-sm"
                  style={{ color: "oklch(0.85 0.04 271)" }}
                >
                  {b.blessing}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
