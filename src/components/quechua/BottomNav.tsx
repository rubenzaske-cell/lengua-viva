"use client";

import { useAppStore, type AppView } from "@/lib/quechua/store";
import { Home, Trophy, User, ShoppingBag, Award } from "lucide-react";

interface NavItem {
  view: AppView;
  label: string;
  icon: typeof Home;
  color: string;
}

const NAV: NavItem[] = [
  { view: "learn", label: "Aprender", icon: Home, color: "text-duo-green" },
  { view: "league", label: "Ligas", icon: Trophy, color: "text-duo-yellow" },
  { view: "achievements", label: "Logros", icon: Award, color: "text-duo-purple" },
  { view: "shop", label: "Tienda", icon: ShoppingBag, color: "text-duo-blue" },
  { view: "profile", label: "Perfil", icon: User, color: "text-duo-orange" },
];

export function BottomNav() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);

  return (
    <nav className="sticky bottom-0 z-30 bg-background/95 backdrop-blur border-t border-border/60 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-2xl grid grid-cols-5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = view === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className="flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors group"
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                  active ? item.color : "text-muted-foreground"
                }`}
                strokeWidth={active ? 2.5 : 2}
                fill={active ? "currentColor" : "none"}
              />
              <span
                className={`text-[10px] font-bold uppercase tracking-wide ${
                  active ? item.color : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
              {active && (
                <span className={`h-1 w-1 rounded-full ${item.color.replace("text-", "bg-")}`} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
