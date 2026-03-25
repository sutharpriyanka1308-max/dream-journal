import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import type { Manifest, SayComment } from "../../backend.d";
import { useAddSayComment, useAllManifests } from "../../hooks/useQueries";
import { StarField } from "../StarField";

interface LocalSayComment extends SayComment {
  localId: string;
}

const MOCK_ATTAINED: (Manifest & {
  id: bigint;
  username: string;
  timestamp: string;
})[] = [
  {
    id: BigInt(101),
    title: "Got My Dream Job ✅",
    description:
      "I manifested my dream role at a creative agency. After 3 months of daily affirmations, the perfect position appeared and I got it on the first interview.",
    ownerId: "mock1" as any,
    isAttained: true,
    boostCount: BigInt(89),
    blessings: Array(14).fill({ blessing: "Amazing!", sender: "x" as any }),
    sayComments: [],
    reactions: [],
    username: "StarGazer88",
    timestamp: "1 week ago",
  },
  {
    id: BigInt(102),
    title: "Found My Soulmate ✅",
    description:
      "I wrote this dream 6 months ago — that I would meet someone who truly sees me. Today we celebrated our 3-month anniversary. The universe delivered perfectly.",
    ownerId: "mock2" as any,
    isAttained: true,
    boostCount: BigInt(124),
    blessings: Array(28).fill({ blessing: "Beautiful!", sender: "x" as any }),
    sayComments: [],
    reactions: [],
    username: "MoonChild",
    timestamp: "2 weeks ago",
  },
  {
    id: BigInt(103),
    title: "Moved to My Dream City ✅",
    description:
      "Barcelona was just a Pinterest board and a dream. I kept manifesting, saving, and believing. I'm writing this from my new apartment in Gràcia.",
    ownerId: "mock3" as any,
    isAttained: true,
    boostCount: BigInt(67),
    blessings: Array(19).fill({ blessing: "Congrats!", sender: "x" as any }),
    sayComments: [],
    reactions: [],
    username: "DreamWeaver",
    timestamp: "1 month ago",
  },
];

interface AttainmentScreenProps {
  requireAuth?: () => boolean;
}

function shortenSender(sender: any): string {
  try {
    const s = sender?.toString?.() ?? String(sender);
    if (s === "You") return "You";
    return s.length > 8 ? `${s.slice(0, 8)}...` : s;
  } catch {
    return "Dreamer";
  }
}

export function AttainmentScreen({ requireAuth }: AttainmentScreenProps) {
  const { data: backendManifests } = useAllManifests();
  const backendAttained = (backendManifests ?? []).filter((m) => m.isAttained);
  const addSayComment = useAddSayComment();
  const [sayOpen, setSayOpen] = useState<number | null>(null);
  const [sayText, setSayText] = useState("");
  const [sayValidation, setSayValidation] = useState("");
  const [saySuccess, setSaySuccess] = useState("");
  const [localComments, setLocalComments] = useState<
    Record<number, LocalSayComment[]>
  >({});

  const allAttained = [
    ...backendAttained.map((m) => ({
      ...m,
      username: "Universe",
      timestamp: "Recent",
    })),
    ...MOCK_ATTAINED,
  ];

  const totalBoosts = allAttained.reduce(
    (acc, m) => acc + Number(m.boostCount),
    0,
  );
  const totalBlessings = allAttained.reduce(
    (acc, m) => acc + m.blessings.length,
    0,
  );

  async function handleSay(
    cardIndex: number,
    manifest: (typeof allAttained)[0],
  ) {
    if (requireAuth && !requireAuth()) {
      setSayValidation("Sign in first ✨");
      return;
    }
    if (!sayText.trim()) {
      setSayValidation("Write something first 💬");
      return;
    }

    const newComment: LocalSayComment = {
      text: sayText.trim(),
      sender: "You" as any,
      localId: `say-${Date.now()}`,
    };

    // Optimistic update
    setLocalComments((prev) => ({
      ...prev,
      [cardIndex]: [...(prev[cardIndex] ?? []), newComment],
    }));
    const capturedText = sayText.trim();
    setSayText("");
    setSayOpen(null);
    setSayValidation("");
    setSaySuccess("Said ✨");
    setTimeout(() => setSaySuccess(""), 2500);

    // Try backend (non-mock only)
    try {
      if (!manifest.id.toString().startsWith("10")) {
        await addSayComment.mutateAsync({
          manifestId: manifest.id,
          text: capturedText,
        });
      }
    } catch {
      // Keep local state
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="relative overflow-hidden px-5 pt-8 pb-6">
        <StarField count={35} />
        <div className="relative z-10">
          <h1
            className="text-3xl font-bold text-foreground"
            style={{ textShadow: "0 0 30px oklch(0.55 0.2 291 / 0.5)" }}
          >
            ✅ Attainment
          </h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.62 0.04 271)" }}>
            Dreams that became reality
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card-glow rounded-2xl p-4 text-center">
            <p
              className="text-2xl font-bold"
              style={{ color: "oklch(0.72 0.16 291)" }}
            >
              ⚡ {totalBoosts.toLocaleString()}
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: "oklch(0.62 0.04 271)" }}
            >
              Total Boosts
            </p>
          </div>
          <div className="glass-card-glow rounded-2xl p-4 text-center">
            <p
              className="text-2xl font-bold"
              style={{ color: "oklch(0.72 0.16 291)" }}
            >
              💫 {totalBlessings.toLocaleString()}
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: "oklch(0.62 0.04 271)" }}
            >
              Total Blessings
            </p>
          </div>
        </div>
      </div>

      {/* Global say success */}
      {saySuccess && (
        <p
          className="text-center text-xs pb-2"
          style={{ color: "oklch(0.72 0.16 291)" }}
        >
          {saySuccess}
        </p>
      )}

      {/* Attained cards */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
        {allAttained.length === 0 && (
          <div
            className="glass-card rounded-3xl p-8 text-center"
            data-ocid="attainment.empty_state"
          >
            <p className="text-4xl mb-3">✨</p>
            <p className="text-foreground font-semibold">
              Your attainments will appear here
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: "oklch(0.62 0.04 271)" }}
            >
              Keep manifesting!
            </p>
          </div>
        )}
        {allAttained.map((m, i) => {
          const cardComments = localComments[i] ?? [];
          const showSaidSection = sayOpen === i || cardComments.length > 0;

          return (
            <div
              key={m.id.toString()}
              className="glass-card-glow rounded-3xl p-5 space-y-4 slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
              data-ocid={`attainment.item.${i + 1}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.47 0.2 291), oklch(0.68 0.17 291))",
                  }}
                >
                  {m.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {m.username}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.62 0.04 271)" }}
                  >
                    {m.timestamp}
                  </p>
                </div>
                <span
                  className="text-xs px-3 py-1 rounded-full font-bold shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.47 0.2 291 / 0.3), oklch(0.68 0.17 291 / 0.2))",
                    color: "oklch(0.82 0.12 291)",
                    border: "1px solid oklch(0.72 0.16 291 / 0.4)",
                    boxShadow: "0 0 12px oklch(0.55 0.2 291 / 0.3)",
                  }}
                >
                  Manifested ✅
                </span>
              </div>

              <p
                className="text-sm leading-relaxed"
                style={{ color: "oklch(0.85 0.04 271)" }}
              >
                {m.description}
              </p>

              <div className="flex items-center gap-3">
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.62 0.04 271)" }}
                >
                  ⚡ {Number(m.boostCount)} · 💫 {m.blessings.length}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (requireAuth && !requireAuth()) return;
                    setSayOpen(sayOpen === i ? null : i);
                    setSayText("");
                    setSayValidation("");
                  }}
                  className="ml-auto px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200"
                  style={{
                    background:
                      sayOpen === i
                        ? "oklch(0.47 0.2 291 / 0.25)"
                        : "oklch(0.96 0.01 291 / 0.07)",
                    border:
                      sayOpen === i
                        ? "1px solid oklch(0.72 0.16 291 / 0.5)"
                        : "1px solid oklch(0.96 0.01 291 / 0.12)",
                    color:
                      sayOpen === i
                        ? "oklch(0.72 0.16 291)"
                        : "oklch(0.77 0.03 271)",
                  }}
                  data-ocid={`attainment.secondary_button.${i + 1}`}
                >
                  💬 Say
                </button>
              </div>

              {sayOpen === i && (
                <div className="space-y-2 slide-up">
                  <Textarea
                    value={sayText}
                    onChange={(e) => {
                      setSayText(e.target.value);
                      setSayValidation("");
                    }}
                    placeholder="Share your words..."
                    className="bg-transparent border rounded-2xl text-sm resize-none min-h-[72px] placeholder:text-muted-foreground"
                    style={{
                      borderColor: "oklch(0.96 0.01 291 / 0.2)",
                      color: "oklch(0.85 0.04 271)",
                    }}
                    data-ocid={`attainment.textarea.${i + 1}`}
                  />
                  {sayValidation && (
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.72 0.16 291)" }}
                    >
                      {sayValidation}
                    </p>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleSay(i, m)}
                    disabled={addSayComment.isPending}
                    className="gradient-btn text-white border-0 rounded-full px-4 text-sm"
                    data-ocid={`attainment.submit_button.${i + 1}`}
                  >
                    {addSayComment.isPending ? "Sending..." : "Send 💬"}
                  </Button>
                </div>
              )}

              {/* Said 💬 section */}
              {showSaidSection && cardComments.length > 0 && (
                <div className="space-y-2 slide-up">
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: "oklch(0.72 0.16 291)",
                      textShadow: "0 0 10px oklch(0.72 0.16 291 / 0.5)",
                    }}
                  >
                    Said 💬
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                    {cardComments.map((c) => (
                      <div
                        key={c.localId}
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
                          {shortenSender(c.sender)}
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: "oklch(0.85 0.04 271)" }}
                        >
                          {c.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
