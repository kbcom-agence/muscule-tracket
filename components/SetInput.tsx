"use client";

import { useState, useCallback } from "react";
import { Minus, Plus, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SetInputProps {
  setNumber: number;
  initialReps?: number;
  initialWeight?: number;
  lastPerf?: { reps: number; weight: number };
  onSave: (reps: number, weight: number) => void;
  onDelete?: () => void;
  isCompleted?: boolean;
}

export function SetInput({
  setNumber,
  initialReps = 0,
  initialWeight = 0,
  lastPerf,
  onSave,
  onDelete,
  isCompleted = false,
}: SetInputProps) {
  const [reps, setReps] = useState(initialReps || lastPerf?.reps || 10);
  const [weight, setWeight] = useState(initialWeight || lastPerf?.weight || 20);
  const [saved, setSaved] = useState(isCompleted);

  const adjustValue = useCallback(
    (type: "reps" | "weight", delta: number) => {
      if (type === "reps") {
        setReps((prev) => Math.max(0, prev + delta));
      } else {
        setWeight((prev) => Math.max(0, prev + delta));
      }
      setSaved(false);
    },
    []
  );

  const handleSave = () => {
    onSave(reps, weight);
    setSaved(true);
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-3 rounded-xl transition-all duration-300",
        saved
          ? "bg-gradient-to-r from-violet-600/20 to-purple-600/10 border border-violet-500/30"
          : "bg-white/5 border border-white/10"
      )}
    >
      {/* Set number */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
        saved
          ? "bg-violet-500/30 text-violet-300"
          : "bg-white/10 text-white/50"
      )}>
        {setNumber}
      </div>

      {/* Reps input */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg"
          onClick={() => adjustValue("reps", -1)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <input
          type="number"
          value={reps}
          onChange={(e) => {
            setReps(parseInt(e.target.value) || 0);
            setSaved(false);
          }}
          className="w-12 text-center h-9 bg-white/10 border border-white/10 rounded-lg text-white font-semibold focus:outline-none focus:border-violet-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg"
          onClick={() => adjustValue("reps", 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <span className="text-white/40 text-sm">x</span>

      {/* Weight input */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg"
          onClick={() => adjustValue("weight", -2.5)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <input
          type="number"
          value={weight}
          onChange={(e) => {
            setWeight(parseFloat(e.target.value) || 0);
            setSaved(false);
          }}
          className="w-14 text-center h-9 bg-white/10 border border-white/10 rounded-lg text-white font-semibold focus:outline-none focus:border-violet-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          step="0.5"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg"
          onClick={() => adjustValue("weight", 2.5)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <span className="text-white/40 text-xs">kg</span>

      {/* Save button */}
      <Button
        variant={saved ? "secondary" : "default"}
        size="icon"
        className={cn(
          "h-9 w-9 rounded-lg ml-auto",
          saved && "bg-violet-500/30 hover:bg-violet-500/40"
        )}
        onClick={handleSave}
      >
        <Check className={cn("h-4 w-4", saved && "text-violet-300")} />
      </Button>

      {/* Delete button */}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
