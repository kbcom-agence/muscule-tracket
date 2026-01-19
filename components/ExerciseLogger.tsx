"use client";

import { useState } from "react";
import { Plus, ChevronUp, ChevronDown, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SetInput } from "./SetInput";
import { cn } from "@/lib/utils";

interface SetData {
  id?: string;
  setNumber: number;
  reps: number;
  weight: number;
}

interface ExerciseLoggerProps {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  lastPerf?: { reps: number; weight: number }[];
  initialSets?: SetData[];
  onSetSave: (exerciseId: string, setNumber: number, reps: number, weight: number) => void;
  onSetDelete?: (exerciseId: string, setNumber: number) => void;
}

export function ExerciseLogger({
  exerciseId,
  exerciseName,
  targetSets,
  lastPerf = [],
  initialSets = [],
  onSetSave,
  onSetDelete,
}: ExerciseLoggerProps) {
  // Track which sets are already saved (from resume)
  const [savedSetNumbers, setSavedSetNumbers] = useState<Set<number>>(() => {
    return new Set(initialSets.map((s) => s.setNumber));
  });

  const [sets, setSets] = useState<SetData[]>(() => {
    if (initialSets.length > 0) {
      // Merge initial sets with target sets count
      const mergedSets: SetData[] = [];
      const maxSets = Math.max(targetSets, initialSets.length);
      for (let i = 0; i < maxSets; i++) {
        const existing = initialSets.find((s) => s.setNumber === i + 1);
        if (existing) {
          mergedSets.push(existing);
        } else {
          mergedSets.push({
            setNumber: i + 1,
            reps: lastPerf[i]?.reps || 10,
            weight: lastPerf[i]?.weight || 20,
          });
        }
      }
      return mergedSets;
    }
    return Array.from({ length: targetSets }, (_, i) => ({
      setNumber: i + 1,
      reps: lastPerf[i]?.reps || 10,
      weight: lastPerf[i]?.weight || 20,
    }));
  });
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSaveSet = (setNumber: number, reps: number, weight: number) => {
    setSets((prev) =>
      prev.map((s) =>
        s.setNumber === setNumber ? { ...s, reps, weight } : s
      )
    );
    setSavedSetNumbers((prev) => new Set(prev).add(setNumber));
    onSetSave(exerciseId, setNumber, reps, weight);
  };

  const handleDeleteSet = (setNumber: number) => {
    setSets((prev) => {
      const filtered = prev.filter((s) => s.setNumber !== setNumber);
      return filtered.map((s, i) => ({ ...s, setNumber: i + 1 }));
    });
    onSetDelete?.(exerciseId, setNumber);
  };

  const addSet = () => {
    const newSetNumber = sets.length + 1;
    const lastSet = sets[sets.length - 1];
    setSets((prev) => [
      ...prev,
      {
        setNumber: newSetNumber,
        reps: lastSet?.reps || 10,
        weight: lastSet?.weight || 20,
      },
    ]);
  };

  const completedSets = savedSetNumbers.size;
  const progress = sets.length > 0 ? (completedSets / sets.length) * 100 : 0;

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{exerciseName}</h3>
              {completedSets === sets.length && sets.length > 0 && (
                <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-white/60">
                {completedSets} / {sets.length} séries
              </span>
              {lastPerf.length > 0 && (
                <span className="text-xs text-violet-400 bg-violet-500/20 px-2 py-0.5 rounded-full">
                  Dernier: {lastPerf[0]?.weight}kg
                </span>
              )}
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="ml-4">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-white/40" />
            ) : (
              <ChevronDown className="h-5 w-5 text-white/40" />
            )}
          </div>
        </div>
      </div>

      {/* Sets */}
      <div
        className={cn(
          "px-4 pb-4 space-y-2 transition-all duration-300",
          !isExpanded && "hidden"
        )}
      >
        {sets.map((set) => (
          <SetInput
            key={set.setNumber}
            setNumber={set.setNumber}
            initialReps={set.reps}
            initialWeight={set.weight}
            lastPerf={lastPerf[set.setNumber - 1]}
            isCompleted={savedSetNumbers.has(set.setNumber)}
            onSave={(reps, weight) => handleSaveSet(set.setNumber, reps, weight)}
            onDelete={sets.length > 1 ? () => handleDeleteSet(set.setNumber) : undefined}
          />
        ))}

        <Button
          variant="outline"
          className="w-full mt-3"
          onClick={addSet}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une série
        </Button>
      </div>
    </div>
  );
}
