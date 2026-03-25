import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import { StarField } from "../StarField";

interface ExperiencePost {
  id: number;
  username: string;
  caption: string;
  gradient: string;
  mediaType: "image" | "video";
  emoji: string;
  timestamp: string;
}

const INITIAL_POSTS: ExperiencePost[] = [
  {
    id: 1,
    username: "LunaWisher",
    caption:
      "The moment I realized my dream of opening a yoga studio was manifesting — I found the perfect space today! 🕉️✨",
    gradient: "media-gradient-1",
    mediaType: "image",
    emoji: "🧘",
    timestamp: "1h ago",
  },
  {
    id: 2,
    username: "StarGazer88",
    caption:
      "Recording my gratitude journal every morning. This practice changed everything for me. 🌅🙏",
    gradient: "media-gradient-2",
    mediaType: "video",
    emoji: "🎥",
    timestamp: "3h ago",
  },
  {
    id: 3,
    username: "MoonChild",
    caption:
      "My vision board came to life — booked my dream trip to Bali! 🌴 The universe listened.",
    gradient: "media-gradient-3",
    mediaType: "image",
    emoji: "🌴",
    timestamp: "6h ago",
  },
  {
    id: 4,
    username: "CosmicSoul",
    caption:
      "First day at my dream company. I manifested this role for 6 months straight. Trust the process. 💫",
    gradient: "media-gradient-4",
    mediaType: "image",
    emoji: "🏢",
    timestamp: "Yesterday",
  },
];

export function ExperienceScreen({
  requireAuth,
}: { requireAuth: () => boolean }) {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [caption, setCaption] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const gradients = [
    "media-gradient-1",
    "media-gradient-2",
    "media-gradient-3",
    "media-gradient-4",
  ];
  const emojis = ["🌟", "✨", "🌙", "💫", "🌈", "🦋"];

  function handlePost() {
    if (!caption.trim()) return;
    if (!requireAuth()) return;
    const newPost: ExperiencePost = {
      id: Date.now(),
      username: "You",
      caption: caption.trim(),
      gradient: gradients[posts.length % gradients.length],
      mediaType: selectedFile?.type.startsWith("video") ? "video" : "image",
      emoji: emojis[posts.length % emojis.length],
      timestamp: "Just now",
    };
    setPosts((prev) => [newPost, ...prev]);
    setCaption("");
    setSelectedFile(null);
    setShowUpload(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="relative overflow-hidden px-5 pt-8 pb-6">
        <StarField count={30} />
        <div className="relative z-10">
          <h1
            className="text-3xl font-bold text-foreground"
            style={{ textShadow: "0 0 30px oklch(0.55 0.2 291 / 0.5)" }}
          >
            🎥 Experience
          </h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.62 0.04 271)" }}>
            Share your manifestation journey
          </p>
        </div>
      </div>

      {/* Upload area */}
      <div className="px-4 pb-4">
        {!showUpload ? (
          <button
            type="button"
            onClick={() => {
              if (requireAuth()) setShowUpload(true);
            }}
            className="w-full glass-card rounded-3xl p-4 flex items-center gap-3 text-left transition-all duration-200 hover:border-primary/30"
            data-ocid="experience.open_modal_button"
          >
            <span className="text-2xl">📸</span>
            <span style={{ color: "oklch(0.62 0.04 271)" }} className="text-sm">
              Share a photo or video experience...
            </span>
          </button>
        ) : (
          <div className="glass-card rounded-3xl p-4 space-y-3 slide-up">
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-2xl p-8 flex flex-col items-center gap-2 transition-all duration-200"
              style={{
                background: "oklch(0.96 0.01 291 / 0.06)",
                border: "2px dashed oklch(0.96 0.01 291 / 0.2)",
              }}
              data-ocid="experience.upload_button"
            >
              <span className="text-3xl">{selectedFile ? "✅" : "📁"}</span>
              <span
                className="text-sm"
                style={{ color: "oklch(0.62 0.04 271)" }}
              >
                {selectedFile ? selectedFile.name : "Tap to add photo or video"}
              </span>
            </button>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write your caption..."
              className="bg-transparent border rounded-full text-sm placeholder:text-muted-foreground"
              style={{ borderColor: "oklch(0.96 0.01 291 / 0.2)" }}
              onKeyDown={(e) => e.key === "Enter" && handlePost()}
              data-ocid="experience.input"
            />
            <div className="flex gap-2">
              <Button
                onClick={handlePost}
                disabled={!caption.trim()}
                className="flex-1 gradient-btn text-white border-0 rounded-full text-sm"
                data-ocid="experience.submit_button"
              >
                Share Experience 🎥
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowUpload(false)}
                className="rounded-full text-sm px-4"
                style={{ color: "oklch(0.62 0.04 271)" }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
        {posts.map((post, i) => (
          <div
            key={post.id}
            className="glass-card rounded-3xl overflow-hidden slide-up"
            style={{ animationDelay: `${i * 0.08}s` }}
            data-ocid={`experience.item.${i + 1}`}
          >
            {/* Media preview */}
            <div
              className={`w-full h-52 flex items-center justify-center text-7xl relative ${post.gradient}`}
            >
              <StarField count={20} />
              <span className="relative z-10 drop-shadow-lg">{post.emoji}</span>
              {post.mediaType === "video" && (
                <div
                  className="absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: "oklch(0.08 0.018 264 / 0.7)",
                    color: "oklch(0.72 0.16 291)",
                  }}
                >
                  ▶ Video
                </div>
              )}
            </div>
            {/* Content */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.47 0.2 291), oklch(0.68 0.17 291))",
                  }}
                >
                  {post.username.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-semibold text-sm text-foreground">
                  {post.username}
                </span>
                <span
                  className="ml-auto text-xs"
                  style={{ color: "oklch(0.62 0.04 271)" }}
                >
                  {post.timestamp}
                </span>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "oklch(0.85 0.04 271)" }}
              >
                {post.caption}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
