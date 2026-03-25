import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { EnergyReaction } from "../../backend.d";
import type { Manifest } from "../../backend.d";
import {
  useAllManifests,
  useBoostManifest,
  useCreateManifest,
  useSendBlessing,
  useSendReaction,
} from "../../hooks/useQueries";
import { ManifestCard } from "../ManifestCard";
import { StarField } from "../StarField";

type MockManifest = Manifest & {
  id: bigint;
  username: string;
  timestamp: string;
  isMock: boolean;
};

const MOCK_MANIFESTS: MockManifest[] = [
  {
    id: BigInt(1),
    title: "Abundant Prosperity",
    description:
      "I am flowing with abundance and financial freedom. Money comes to me effortlessly and I use it to create beauty in this world.",
    ownerId: "mock1" as any,
    isAttained: false,
    boostCount: BigInt(24),
    blessings: [],
    sayComments: [],
    reactions: [],
    username: "LunaWisher",
    timestamp: "2h ago",
    isMock: true,
  },
  {
    id: BigInt(2),
    title: "Dream Career",
    description:
      "My dream job has found me. I am doing work I love, surrounded by people who inspire me, and I am valued beyond measure.",
    ownerId: "mock2" as any,
    isAttained: false,
    boostCount: BigInt(18),
    blessings: [{ blessing: "So be it!", sender: "mock3" as any }],
    sayComments: [],
    reactions: [],
    username: "StarGazer88",
    timestamp: "5h ago",
    isMock: true,
  },
  {
    id: BigInt(3),
    title: "Perfect Love",
    description:
      "My soulmate has arrived. We share deep connection, laughter, and infinite understanding. Love is my natural state.",
    ownerId: "mock3" as any,
    isAttained: false,
    boostCount: BigInt(41),
    blessings: [],
    sayComments: [],
    reactions: [],
    username: "MoonChild",
    timestamp: "Yesterday",
    isMock: true,
  },
  {
    id: BigInt(4),
    title: "Radiant Health",
    description:
      "Every cell in my body vibrates with perfect health. I wake up each morning feeling energized, light, and completely alive.",
    ownerId: "mock4" as any,
    isAttained: false,
    boostCount: BigInt(13),
    blessings: [],
    sayComments: [],
    reactions: [],
    username: "CosmicSoul",
    timestamp: "2 days ago",
    isMock: true,
  },
  {
    id: BigInt(5),
    title: "World Travel",
    description:
      "I am traveling the world freely, discovering new cultures, tasting new foods, and collecting stories that light my heart.",
    ownerId: "mock5" as any,
    isAttained: false,
    boostCount: BigInt(37),
    blessings: [],
    sayComments: [],
    reactions: [],
    username: "DreamWeaver",
    timestamp: "3 days ago",
    isMock: true,
  },
];

export function DreamScreen({ requireAuth }: { requireAuth: () => boolean }) {
  const [dreamText, setDreamText] = useState("");
  useAllManifests();
  const createManifest = useCreateManifest();
  const boostManifest = useBoostManifest();
  const sendBlessing = useSendBlessing();
  const sendReaction = useSendReaction();
  const [localManifests, setLocalManifests] = useState<MockManifest[]>([]);

  const allManifests = [...localManifests, ...MOCK_MANIFESTS];

  async function handleManifest() {
    if (!dreamText.trim()) return;
    if (!requireAuth()) return;
    const newEntry: MockManifest = {
      id: BigInt(Date.now()),
      title: dreamText.trim(),
      description: dreamText.trim(),
      ownerId: "me" as any,
      isAttained: false,
      boostCount: BigInt(0),
      blessings: [],
      sayComments: [],
      reactions: [],
      username: "You",
      timestamp: "Just now",
      isMock: false,
    };
    setLocalManifests((prev) => [newEntry, ...prev]);
    setDreamText("");
    try {
      await createManifest.mutateAsync({
        title: dreamText.trim(),
        description: dreamText.trim(),
      });
    } catch {
      // silently ignore backend errors, local state is set
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="relative overflow-hidden px-5 pt-8 pb-6">
        <StarField count={40} />
        <div className="relative z-10">
          <h1
            className="text-3xl font-bold text-foreground"
            style={{ textShadow: "0 0 30px oklch(0.55 0.2 291 / 0.5)" }}
          >
            🌙 Dream Journal
          </h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.62 0.04 271)" }}>
            Manifest your heart's desires
          </p>
        </div>
      </div>

      {/* Manifest Input */}
      <div className="px-4 pb-4">
        <div className="glass-card rounded-3xl p-4 space-y-3">
          <Textarea
            value={dreamText}
            onChange={(e) => setDreamText(e.target.value)}
            placeholder="Type your dream wish affirmation..."
            className="bg-transparent border-0 text-foreground placeholder:text-muted-foreground resize-none min-h-[90px] focus:ring-0 focus-visible:ring-0 p-0 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleManifest();
              }
            }}
            data-ocid="dream.textarea"
          />
          <Button
            onClick={handleManifest}
            disabled={!dreamText.trim() || createManifest.isPending}
            className="gradient-btn text-white font-bold border-0 rounded-full px-6 py-2 text-sm w-full"
            data-ocid="dream.primary_button"
          >
            {createManifest.isPending ? "Manifesting..." : "Manifest ✨"}
          </Button>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
        {allManifests.map((m, i) => (
          <ManifestCard
            key={m.id.toString()}
            manifest={m}
            index={i}
            requireAuth={requireAuth}
            onBoost={async (id) => {
              await boostManifest.mutateAsync(id);
            }}
            onBless={async (id, msg) => {
              return sendBlessing.mutateAsync({ manifestId: id, message: msg });
            }}
            onReact={async (id, reaction) => {
              await sendReaction.mutateAsync({ manifestId: id, reaction });
            }}
          />
        ))}
      </div>
    </div>
  );
}
