"use client";

import Link from "next/link";
import { ChevronRight, Calendar, Dumbbell, TrendingUp } from "lucide-react";
import { formatDate, calculateVolume } from "@/lib/utils";

interface WorkoutSet {
  reps: number;
  weight: number;
}

interface WorkoutSummaryProps {
  id: string;
  sessionName: string;
  date: string;
  sets: WorkoutSet[];
  exerciseCount: number;
}

export function WorkoutSummary({
  id,
  sessionName,
  date,
  sets,
  exerciseCount,
}: WorkoutSummaryProps) {
  const totalVolume = calculateVolume(sets);

  return (
    <Link href={`/history/${id}`}>
      <div className="glass-card p-4 cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20">
              <Dumbbell className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{sessionName}</h3>
              <div className="flex items-center gap-1 text-sm text-white/50 mt-0.5">
                <Calendar className="w-3 h-3" />
                {formatDate(date)}
              </div>
              <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                <span>{exerciseCount} exos</span>
                <span>{sets.length} séries</span>
                <span className="flex items-center gap-1 text-violet-400">
                  <TrendingUp className="w-3 h-3" />
                  {totalVolume.toLocaleString()} kg
                </span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
}
