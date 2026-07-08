"use client";

import { useState } from "react";
import { SHOP_ITEMS } from "@/lib/quechua/content";
import { useAppStore } from "@/lib/quechua/store";
import { Check, Heart, Zap, Snowflake, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { IntiCoin } from "@/components/quechua/IntiCoin";

const TYPE_ICON = {
  hearts: Heart,
  frozen: Snowflake,
  boost: Zap,
  cosmetic: Sparkles,
};

export function ShopView() {
  const stats = useAppStore((s) => s.stats);
  const setStats = useAppStore((s) => s.setStats);
  const setProgress = useAppStore((s) => s.setProgress);
  const setXpBoostUntil = useAppStore((s) => s.setXpBoostUntil);
  const [busy, setBusy] = useState<string | null>(null);

  const buy = async (itemId: string) => {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item || !stats) return;
    if (stats.gems < item.cost) {
      toast.error("Intis insuficientes", { description: `Necesitas ${item.cost - stats.gems} intis más` });
      return;
    }
    setBusy(itemId);
    try {
      const r = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const data = await r.json();
      if (!r.ok) {
        toast.error(data.error || "No se pudo comprar");
        return;
      }
      if (data.snapshot) {
        setStats(data.snapshot.stats);
        setProgress(data.snapshot.progress);
      }
      if (data.boost) {
        setXpBoostUntil(data.boost);
        toast.success("¡Doble Quipus activado!", { description: "Por 15 minutos" });
      } else {
        toast.success(`¡${item.name} comprado!`, { description: `-${item.cost} intis` });
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setBusy(null);
    }
  };

  if (!stats) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-10">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold">Tienda</h1>
        <div className="inline-flex items-center gap-2 mt-2 bg-duo-yellow/10 border border-duo-yellow/30 rounded-full px-4 py-1">
          <IntiCoin size={22} />
          <span className="font-extrabold text-duo-yellow">{stats.gems} intis</span>
        </div>
      </div>

      {/* Estado de corazones */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-duo-red" fill="currentColor" />
            <span className="font-extrabold">Corazones</span>
          </div>
          <span className="font-extrabold text-duo-red">{stats.hearts}/{stats.maxHearts}</span>
        </div>
        {stats.hearts < stats.maxHearts && (
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Se regeneran 1 cada 30 min · o cárgalos con intis abajo
          </p>
        )}
      </div>

      {/* Items */}
      <div className="space-y-3">
        {SHOP_ITEMS.map((item, i) => {
          const Icon = TYPE_ICON[item.type];
          const canAfford = stats.gems >= item.cost;
          const isBusy = busy === item.id;
          // Estado especial para refill si ya está lleno
          const disabled =
            !canAfford ||
            (item.id === "refill_hearts" && stats.hearts >= stats.maxHearts);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4"
            >
              <div className="text-4xl shrink-0 w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold flex items-center gap-1">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  {item.name}
                </h3>
                <p className="text-xs text-muted-foreground font-semibold">{item.description}</p>
              </div>
              <button
                onClick={() => buy(item.id)}
                disabled={disabled || isBusy}
                className={`duo-btn ${canAfford ? "duo-btn-yellow" : "duo-btn-secondary"} shrink-0`}
                style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
              >
                {isBusy ? (
                  "..."
                ) : (
                  <span className="flex items-center gap-1">
                    <IntiCoin size={16} />
                    {item.cost}
                  </span>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground font-semibold">
          Gana intis completando lecciones y logros
        </p>
      </div>
    </div>
  );
}
