import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  icon: "star" | "heart" | "angel" | null;
  onActivate: (icon: "star" | "heart" | "angel") => void;
}

const TIERS = [
  {
    price: "$0.99",
    label: "Spark",
    desc: "A tiny burst of energy",
    value: "spark",
  },
  {
    price: "$2.99",
    label: "Bloom",
    desc: "Flowing cosmic light",
    value: "bloom",
  },
  {
    price: "$9.99",
    label: "Radiance",
    desc: "Full divine luminance",
    value: "radiance",
  },
];

const ICON_LABELS: Record<
  "star" | "heart" | "angel",
  { emoji: string; name: string }
> = {
  star: { emoji: "⭐", name: "Star" },
  heart: { emoji: "❤️", name: "Heart" },
  angel: { emoji: "😇", name: "Angel" },
};

export function PaymentModal({
  open,
  onClose,
  icon,
  onActivate,
}: PaymentModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [activated, setActivated] = useState(false);

  const iconInfo = icon ? ICON_LABELS[icon] : null;

  function handleActivate() {
    if (!icon || !selected) return;
    setActivated(true);
    setTimeout(() => {
      onActivate(icon);
      setActivated(false);
      setSelected(null);
      onClose();
    }, 1200);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm mx-auto border-0 p-0 overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.12 0.04 291) 0%, oklch(0.08 0.018 264) 100%)",
          border: "1px solid oklch(0.72 0.16 291 / 0.25)",
          boxShadow:
            "0 0 60px oklch(0.46 0.18 291 / 0.4), 0 8px 32px oklch(0.08 0.018 264 / 0.8)",
        }}
        data-ocid="gratitude.modal"
      >
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-foreground">
              {activated ? (
                <span className="glow-text">
                  Energy Activated {iconInfo?.emoji}
                </span>
              ) : (
                <>
                  Unlock {iconInfo?.emoji} {iconInfo?.name} Energy
                </>
              )}
            </DialogTitle>
            {!activated && (
              <p className="text-center text-muted-foreground text-sm mt-1">
                Choose your level of cosmic energy
              </p>
            )}
          </DialogHeader>

          {activated ? (
            <div className="py-8 text-center">
              <div
                className="text-6xl mb-4"
                style={{ animation: "boost-pop 0.5s ease-out" }}
              >
                {iconInfo?.emoji}
              </div>
              <p className="text-foreground font-semibold glow-text">
                Your energy is flowing ✨
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {TIERS.map((tier) => (
                <button
                  type="button"
                  key={tier.value}
                  onClick={() => setSelected(tier.value)}
                  className="w-full rounded-2xl p-4 text-left transition-all duration-200"
                  style={{
                    background:
                      selected === tier.value
                        ? "linear-gradient(135deg, oklch(0.47 0.2 291 / 0.3), oklch(0.68 0.17 291 / 0.2))"
                        : "oklch(0.96 0.01 291 / 0.06)",
                    border:
                      selected === tier.value
                        ? "1px solid oklch(0.72 0.16 291 / 0.5)"
                        : "1px solid oklch(0.96 0.01 291 / 0.1)",
                    boxShadow:
                      selected === tier.value
                        ? "0 0 16px oklch(0.55 0.2 291 / 0.3)"
                        : "none",
                  }}
                  data-ocid="gratitude.select"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">{tier.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {tier.desc}
                      </p>
                    </div>
                    <span
                      className="text-xl font-bold"
                      style={{ color: "oklch(0.72 0.16 291)" }}
                    >
                      {tier.price}
                    </span>
                  </div>
                </button>
              ))}

              <div className="pt-2 space-y-2">
                <Button
                  className="w-full gradient-btn text-white font-bold py-3 rounded-full border-0"
                  disabled={!selected}
                  onClick={handleActivate}
                  data-ocid="gratitude.confirm_button"
                >
                  Activate Energy ✨
                </Button>
                <button
                  type="button"
                  className="w-full text-center text-sm py-2 transition-opacity hover:opacity-100 opacity-50"
                  style={{ color: "oklch(0.62 0.04 271)" }}
                  onClick={onClose}
                  data-ocid="gratitude.cancel_button"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
