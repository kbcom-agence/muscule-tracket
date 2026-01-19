"use client";

import Link from "next/link";
import { ChevronRight, Dumbbell, Sparkles, Play, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionCardProps {
  id: string;
  name: string;
  exerciseCount: number;
  lastWorkoutDate?: string;
  className?: string;
  inProgress?: { setCount: number };
}

const sessionGradients: Record<string, string> = {
  "Torse A": "from-violet-600/20 via-purple-600/10 to-transparent",
  "Torse B": "from-fuchsia-600/20 via-pink-600/10 to-transparent",
  "Membres A": "from-blue-600/20 via-cyan-600/10 to-transparent",
  "Membres B": "from-emerald-600/20 via-teal-600/10 to-transparent",
  default: "from-violet-600/20 via-purple-600/10 to-transparent",
};

const sessionIcons: Record<string, string> = {
  "Torse A": "from-violet-500 to-purple-600",
  "Torse B": "from-fuchsia-500 to-pink-600",
  "Membres A": "from-blue-500 to-cyan-600",
  "Membres B": "from-emerald-500 to-teal-600",
  default: "from-violet-500 to-purple-600",
};

export function SessionCard({
  id,
  name,
  exerciseCount,
  lastWorkoutDate,
  className,
  inProgress,
}: SessionCardProps) {
  const gradientClass = sessionGradients[name] || sessionGradients.default;
  const iconGradient = sessionIcons[name] || sessionIcons.default;

  return (
    <div className={cn("relative", className)}>
      <Link href={`/session/${id}`}>
        <div
          className={cn(
            "glass-card p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group overflow-hidden relative",
            inProgress && "ring-2 ring-emerald-500/50"
          )}
        >
          {/* Background gradient */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r opacity-50 transition-opacity group-hover:opacity-70",
            inProgress ? "from-emerald-600/20 via-teal-600/10 to-transparent" : gradientClass
          )} />

          {/* In progress badge */}
          {inProgress && (
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium px-2 py-1 rounded-full border border-emerald-500/30">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              En cours
            </div>
          )}

          {/* Content */}
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br shadow-lg",
                inProgress ? "from-emerald-500 to-teal-600" : iconGradient
              )}>
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                  {name}
                  <Sparkles className="w-4 h-4 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-white/60">
                  {exerciseCount} exercice{exerciseCount !== 1 ? "s" : ""}
                </p>
                {inProgress ? (
                  <p className="text-xs text-emerald-400 mt-0.5">
                    {inProgress.setCount} série{inProgress.setCount !== 1 ? "s" : ""} enregistrée{inProgress.setCount !== 1 ? "s" : ""}
                  </p>
                ) : lastWorkoutDate && (
                  <p className="text-xs text-violet-400/80 mt-0.5">
                    Dernier: {lastWorkoutDate}
                  </p>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>

      {/* Quick resume button */}
      {inProgress && (
        <Link
          href={`/session/${id}/workout`}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all"
        >
          <Play className="w-4 h-4" />
          Reprendre
        </Link>
      )}
    </div>
  );
}
