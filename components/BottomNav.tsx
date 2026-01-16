"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Accueil" },
  { href: "/history", icon: History, label: "Historique" },
  { href: "/stats", icon: BarChart3, label: "Stats" },
  { href: "/settings", icon: Settings, label: "Réglages" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 max-w-lg mx-auto">
      <div className="glass-card flex items-center justify-around h-16 px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href ||
            (href !== "/" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full touch-target transition-all duration-300 rounded-xl",
                isActive
                  ? "text-white"
                  : "text-white/50 hover:text-white/80"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive && "bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-500/30"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={cn(
                "text-[10px] mt-1 font-medium transition-all",
                isActive && "text-violet-400"
              )}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
