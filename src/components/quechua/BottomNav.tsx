"use client";

import { useAppStore, type AppView } from "@/lib/quechua/store";
import { Home, Trophy, User, ShoppingBag, Award } from "lucide-react";

interface NavItem {
  view: AppView;
  label: string;
  icon: typeof Home;
  color: string;
  activeBg: string;
}

const NAV: NavItem[] = [
  { view: "learn", label: "Aprender", icon: Home, color: "text-duo-green", activeBg: "bg-duo-green/10" },
  { view: "league", label: "Ligas", icon: Trophy, color: "text-duo-yellow", activeBg: "bg-duo-yellow/10" },
  { view: "achievements", label: "Logros", icon: Award, color: "text-duo-purple", activeBg: "bg-duo-purple/10" },
  { view: "shop", label: "Tienda", icon: ShoppingBag, color: "text-duo-blue", activeBg: "bg-duo-blue/10" },
  { view: "profile", label: "Perfil", icon: User, color: "text-duo-orange", activeBg: "bg-duo-orange/10" },
];

export function BottomNav() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);

  return (
    <nav className="sticky bottom-0 z-30 bg-background/95 backdrop-blur-xl border-t border-border/60 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-2xl grid grid-cols-5 px-2 py-1.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = view === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className="flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg transition-all duration-200 group"
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <span className={`flex items-center justify-center w-11 h-7 rounded-full transition-all duration-200 ${active ? item.activeBg : ""}`}>
                <Icon
                  className={`w-5 h-5 transition-all duration-200 ${active ? item.color : "text-muted-foreground"} group-hover:scale-110`}
                  strokeWidth={active ? 2.5 : 2}
                  fill={active ? "currentColor" : "none"}
                />
              </span>
              <span
                className={`text-[10px] font-bold tracking-wide transition-colors duration-200 ${
                  active ? item.color : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
