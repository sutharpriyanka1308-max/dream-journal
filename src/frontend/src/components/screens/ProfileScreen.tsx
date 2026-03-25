import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useRef, useState } from "react";
import type { Manifest } from "../../backend.d";
import { EnergyReaction } from "../../backend.d";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useAddEnergyGratitude,
  useCallerProfile,
  useCreateManifest,
  useSaveProfile,
} from "../../hooks/useQueries";
import { ManifestCard } from "../ManifestCard";
import { StarField } from "../StarField";

type MockManifest = Manifest & {
  id: bigint;
  username: string;
  timestamp: string;
  isMock: boolean;
};

const SAMPLE_MY_MANIFESTS: MockManifest[] = [
  {
    id: BigInt(201),
    title: "Creative Business",
    description:
      "I am building a thriving creative business that inspires thousands and gives me complete freedom to express myself.",
    ownerId: "me" as any,
    isAttained: false,
    boostCount: BigInt(7),
    blessings: [],
    sayComments: [],
    reactions: [],
    username: "You",
    timestamp: "4 days ago",
    isMock: true,
  },
  {
    id: BigInt(202),
    title: "Morning Energy",
    description:
      "I wake up every morning with boundless energy, clear mind, and deep gratitude for this beautiful life.",
    ownerId: "me" as any,
    isAttained: false,
    boostCount: BigInt(3),
    blessings: [],
    sayComments: [],
    reactions: [],
    username: "You",
    timestamp: "1 week ago",
    isMock: true,
  },
];

const SAMPLE_MY_ATTAINMENTS: MockManifest[] = [
  {
    id: BigInt(301),
    title: "Started My Meditation Practice",
    description:
      "I manifested a daily meditation practice that brings me peace and clarity every single morning.",
    ownerId: "me" as any,
    isAttained: true,
    boostCount: BigInt(15),
    blessings: Array(5).fill({ blessing: "Amazing!", sender: "x" as any }),
    sayComments: [],
    reactions: [],
    username: "You",
    timestamp: "3 weeks ago",
    isMock: true,
  },
];

interface ProfileScreenProps {
  badges: Set<"star" | "heart" | "angel">;
  requireAuth: () => boolean;
}

export function ProfileScreen({ badges, requireAuth }: ProfileScreenProps) {
  const { identity } = useInternetIdentity();
  const { data: profile } = useCallerProfile();
  const createManifest = useCreateManifest();
  const saveProfile = useSaveProfile();
  const addEnergyGratitude = useAddEnergyGratitude();
  const [dreamText, setDreamText] = useState("");
  const [localManifests, setLocalManifests] = useState<MockManifest[]>([]);
  const [reactionMsg, setReactionMsg] = useState("");
  const [localStars, setLocalStars] = useState(0);
  const [localHearts, setLocalHearts] = useState(0);
  const [localAngels, setLocalAngels] = useState(0);

  // Edit Profile state
  const [editOpen, setEditOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const [editUsernameError, setEditUsernameError] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [localUsername, setLocalUsername] = useState("");
  const [localBio, setLocalBio] = useState("");
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseUsername =
    profile?.username ||
    (identity
      ? `${identity.getPrincipal().toString().slice(0, 12)}...`
      : "Dreamer");
  const baseBio =
    profile?.bio ||
    "Every thought is a seed. Every word is a prayer. Every dream is real. ✨";

  const username = localUsername || baseUsername;
  const bio = localBio || baseBio;
  const photoSrc = localPhoto;

  const myManifests = [...localManifests, ...SAMPLE_MY_MANIFESTS];
  const myAttainments = SAMPLE_MY_ATTAINMENTS;

  function openEditProfile() {
    setEditUsername(username);
    setEditBio(bio);
    setEditPhotoPreview(localPhoto);
    setEditUsernameError("");
    setEditError("");
    setEditOpen(true);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditPhotoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSaveProfile() {
    if (!editUsername.trim()) {
      setEditUsernameError("Username cannot be empty");
      return;
    }
    setEditUsernameError("");
    setEditSaving(true);
    setEditError("");

    try {
      const updatedProfile = {
        ...(profile ?? {
          bio: "",
          gratitudeStars: BigInt(0),
          username: "",
          totalBoosts: BigInt(0),
          gratitudeHearts: BigInt(0),
          gratitude: BigInt(0),
          wish: BigInt(0),
          desire: BigInt(0),
          totalBlessings: BigInt(0),
          gratitudeAngles: BigInt(0),
          mystery: BigInt(0),
          manifestPower: BigInt(0),
        }),
        username: editUsername.trim(),
        bio: editBio.trim(),
      };
      await saveProfile.mutateAsync(updatedProfile);
      setLocalUsername(editUsername.trim());
      setLocalBio(editBio.trim());
      if (editPhotoPreview) setLocalPhoto(editPhotoPreview);
      setEditOpen(false);
      setProfileSuccess("Profile updated ✨");
      setTimeout(() => setProfileSuccess(""), 2500);
    } catch {
      setEditError("Could not save profile, please try again");
    } finally {
      setEditSaving(false);
    }
  }

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
      /* ignore */
    }
  }

  async function handleProfileReaction(type: EnergyReaction) {
    if (!requireAuth()) return;
    if (type === EnergyReaction.star) setLocalStars((s) => s + 1);
    else if (type === EnergyReaction.heart) setLocalHearts((s) => s + 1);
    else setLocalAngels((s) => s + 1);

    setReactionMsg("✨ Energy added!");
    setTimeout(() => setReactionMsg(""), 2000);

    if (!identity) return;
    try {
      await addEnergyGratitude.mutateAsync({
        profileId: identity.getPrincipal(),
        energyType: type,
      });
    } catch {
      // Silently keep local state
    }
  }

  const stars = Number(profile?.gratitudeStars ?? BigInt(0)) + localStars;
  const hearts = Number(profile?.gratitudeHearts ?? BigInt(0)) + localHearts;
  const angels = Number(profile?.gratitudeAngles ?? BigInt(0)) + localAngels;

  return (
    <div className="flex flex-col h-full">
      {/* Profile Header */}
      <div className="relative overflow-hidden px-5 pt-8 pb-6">
        <StarField count={30} />
        <div className="relative z-10 flex flex-col items-center">
          {/* Avatar */}
          <div className="relative mb-4">
            {photoSrc ? (
              <img
                src={photoSrc}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover glow-avatar"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold glow-avatar"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.47 0.2 291), oklch(0.68 0.17 291))",
                }}
              >
                {username.slice(0, 2).toUpperCase()}
              </div>
            )}
            {/* Badges */}
            {badges.size > 0 && (
              <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                {badges.has("star") && <span className="text-base">⭐</span>}
                {badges.has("heart") && <span className="text-base">❤️</span>}
                {badges.has("angel") && <span className="text-base">😇</span>}
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <h2 className="text-xl font-bold text-foreground">{username}</h2>
              {badges.size > 0 && (
                <span className="text-sm" title="Energy Badges">
                  {badges.has("star") ? "⭐" : ""}
                  {badges.has("heart") ? "❤️" : ""}
                  {badges.has("angel") ? "😇" : ""}
                </span>
              )}
            </div>
            <p
              className="text-sm mt-1 max-w-xs text-center"
              style={{ color: "oklch(0.62 0.04 271)" }}
            >
              {bio}
            </p>

            {/* Edit Profile button */}
            <button
              type="button"
              onClick={openEditProfile}
              className="mt-3 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
              style={{
                background: "oklch(0.47 0.2 291 / 0.2)",
                border: "1px solid oklch(0.72 0.16 291 / 0.35)",
                color: "oklch(0.72 0.16 291)",
              }}
              data-ocid="profile.edit_button"
            >
              ✏️ Edit Profile
            </button>

            {profileSuccess && (
              <p
                className="text-xs mt-2"
                style={{ color: "oklch(0.72 0.16 291)" }}
              >
                {profileSuccess}
              </p>
            )}
          </div>

          {/* Energy counts - clickable to add */}
          <div className="flex items-center gap-4 mt-4">
            {(
              [
                ["⭐", stars, EnergyReaction.star],
                ["❤️", hearts, EnergyReaction.heart],
                ["😇", angels, EnergyReaction.angelBadge],
              ] as [string, number, EnergyReaction][]
            ).map(([emoji, count, type]) => (
              <button
                type="button"
                key={emoji}
                onClick={() => handleProfileReaction(type)}
                className="flex flex-col items-center transition-transform active:scale-110"
                title={`Add ${emoji} energy`}
              >
                <span className="text-xl">{emoji}</span>
                <span
                  className="text-xs font-bold"
                  style={{ color: "oklch(0.72 0.16 291)" }}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
          {reactionMsg && (
            <p
              className="text-xs mt-2"
              style={{ color: "oklch(0.72 0.16 291)" }}
            >
              {reactionMsg}
            </p>
          )}
        </div>
      </div>

      {/* Manifest input */}
      <div className="px-4 pb-4">
        <div className="glass-card rounded-3xl p-4 space-y-3">
          <Textarea
            value={dreamText}
            onChange={(e) => setDreamText(e.target.value)}
            placeholder="Type your dream wish affirmation..."
            className="bg-transparent border-0 text-foreground placeholder:text-muted-foreground resize-none min-h-[72px] focus:ring-0 focus-visible:ring-0 p-0 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleManifest();
              }
            }}
            data-ocid="profile.textarea"
          />
          <Button
            onClick={handleManifest}
            disabled={!dreamText.trim() || createManifest.isPending}
            className="gradient-btn text-white font-bold border-0 rounded-full px-6 py-2 text-sm w-full"
            data-ocid="profile.primary_button"
          >
            Manifest ✨
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <Tabs defaultValue="dreams">
          <TabsList
            className="w-full mb-4 rounded-full p-1"
            style={{
              background: "oklch(0.96 0.01 291 / 0.07)",
              border: "1px solid oklch(0.96 0.01 291 / 0.12)",
            }}
          >
            <TabsTrigger
              value="dreams"
              className="flex-1 rounded-full data-[state=active]:text-white text-sm font-semibold"
              data-ocid="profile.tab"
            >
              My Dreams
            </TabsTrigger>
            <TabsTrigger
              value="attainments"
              className="flex-1 rounded-full data-[state=active]:text-white text-sm font-semibold"
              data-ocid="profile.tab"
            >
              My Attainments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dreams" className="space-y-4 mt-0">
            {myManifests.length === 0 && (
              <div
                className="glass-card rounded-3xl p-8 text-center"
                data-ocid="profile.empty_state"
              >
                <p className="text-4xl mb-3">🌙</p>
                <p className="text-foreground font-semibold">
                  No manifests yet
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: "oklch(0.62 0.04 271)" }}
                >
                  Write your first dream above
                </p>
              </div>
            )}
            {myManifests.map((m, i) => (
              <ManifestCard
                key={m.id.toString()}
                manifest={m}
                index={i}
                requireAuth={requireAuth}
              />
            ))}
          </TabsContent>

          <TabsContent value="attainments" className="space-y-4 mt-0">
            {myAttainments.length === 0 && (
              <div
                className="glass-card rounded-3xl p-8 text-center"
                data-ocid="profile.empty_state"
              >
                <p className="text-4xl mb-3">✅</p>
                <p className="text-foreground font-semibold">
                  No attainments yet
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: "oklch(0.62 0.04 271)" }}
                >
                  Your manifested dreams will appear here
                </p>
              </div>
            )}
            {myAttainments.map((m, i) => (
              <ManifestCard
                key={m.id.toString()}
                manifest={m}
                index={i}
                showSayOnly
                requireAuth={requireAuth}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          className="max-w-sm rounded-3xl p-6 border-0"
          style={{
            background: "oklch(0.1 0.02 264)",
            border: "1px solid oklch(0.72 0.16 291 / 0.2)",
            boxShadow: "0 0 40px oklch(0.55 0.2 291 / 0.15)",
          }}
          data-ocid="profile.dialog"
        >
          <DialogHeader>
            <DialogTitle
              className="text-lg font-bold text-foreground text-center"
              style={{ textShadow: "0 0 20px oklch(0.55 0.2 291 / 0.4)" }}
            >
              ✨ Edit Profile
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {/* Photo */}
            <div className="flex flex-col items-center gap-3">
              {editPhotoPreview ? (
                <img
                  src={editPhotoPreview}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover"
                  style={{ border: "2px solid oklch(0.72 0.16 291 / 0.4)" }}
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.47 0.2 291), oklch(0.68 0.17 291))",
                  }}
                >
                  {(editUsername || username).slice(0, 2).toUpperCase()}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
                style={{
                  background: "oklch(0.47 0.2 291 / 0.2)",
                  border: "1px solid oklch(0.72 0.16 291 / 0.3)",
                  color: "oklch(0.72 0.16 291)",
                }}
                data-ocid="profile.upload_button"
              >
                📷 Change Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-username"
                className="text-xs font-semibold"
                style={{ color: "oklch(0.72 0.16 291)" }}
              >
                Username
              </Label>
              <Input
                id="edit-username"
                value={editUsername}
                onChange={(e) => {
                  setEditUsername(e.target.value);
                  setEditUsernameError("");
                }}
                placeholder="Your name"
                className="bg-transparent border rounded-2xl text-sm"
                style={{
                  borderColor: editUsernameError
                    ? "oklch(0.6 0.2 30)"
                    : "oklch(0.96 0.01 291 / 0.2)",
                  color: "oklch(0.85 0.04 271)",
                }}
                data-ocid="profile.input"
              />
              {editUsernameError && (
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.6 0.2 30)" }}
                  data-ocid="profile.error_state"
                >
                  {editUsernameError}
                </p>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-bio"
                className="text-xs font-semibold"
                style={{ color: "oklch(0.72 0.16 291)" }}
              >
                Bio
              </Label>
              <Textarea
                id="edit-bio"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Share your energy..."
                className="bg-transparent border rounded-2xl text-sm resize-none min-h-[80px]"
                style={{
                  borderColor: "oklch(0.96 0.01 291 / 0.2)",
                  color: "oklch(0.85 0.04 271)",
                }}
                data-ocid="profile.textarea"
              />
            </div>

            {editError && (
              <p
                className="text-xs text-center"
                style={{ color: "oklch(0.6 0.2 30)" }}
                data-ocid="profile.error_state"
              >
                {editError}
              </p>
            )}

            <Button
              onClick={handleSaveProfile}
              disabled={editSaving}
              className="gradient-btn text-white font-bold border-0 rounded-full w-full py-3"
              data-ocid="profile.save_button"
            >
              {editSaving ? "Saving..." : "Save ✨"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
