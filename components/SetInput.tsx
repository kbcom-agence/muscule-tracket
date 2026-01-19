"use client";

import { useState, useRef } from "react";
import { Check, X, RotateCcw } from "lucide-react";
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

const REPS_PRESETS = [6, 8, 10, 12, 15];
const WEIGHT_ADJUSTMENTS = [-5, -2.5, 2.5, 5];

export function SetInput({
  setNumber,
  initialReps = 0,
  initialWeight = 0,
  lastPerf,
  onSave,
  onDelete,
  isCompleted = false,
}: SetInputProps) {
  const defaultReps = initialReps || lastPerf?.reps || 10;
  const defaultWeight = initialWeight || lastPerf?.weight || 20;

  const [reps, setReps] = useState(defaultReps);
  const [weight, setWeight] = useState(defaultWeight);
  const [saved, setSaved] = useState(isCompleted);
  const [editingField, setEditingField] = useState<"reps" | "weight" | null>(null);

  const repsInputRef = useRef<HTMLInputElement>(null);
  const weightInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave(reps, weight);
    setSaved(true);
    setEditingField(null);
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleUndo = () => {
    setSaved(false);
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const handleRepsClick = () => {
    if (saved) return;
    setEditingField("reps");
    setTimeout(() => repsInputRef.current?.select(), 50);
  };

  const handleWeightClick = () => {
    if (saved) return;
    setEditingField("weight");
    setTimeout(() => weightInputRef.current?.select(), 50);
  };

  const adjustWeight = (delta: number) => {
    setWeight((prev) => Math.max(0, Math.round((prev + delta) * 2) / 2));
    setSaved(false);
  };

  // Compact view when saved
  if (saved) {
    return (
      <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-600/20 to-teal-600/10 border border-emerald-500/30">
        <div className="flex items-center gap-3">
          {/* Set number with checkmark */}
          <div className="w-8 h-8 rounded-lg bg-emerald-500/30 flex items-center justify-center">
            <Check className="w-4 h-4 text-emerald-400" />
          </div>

          {/* Values display */}
          <div className="flex-1 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">{reps}</span>
              <span className="text-sm text-white/50">reps</span>
            </div>
            <div className="text-white/30">×</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">{weight}</span>
              <span className="text-sm text-white/50">kg</span>
            </div>
          </div>

          {/* Undo button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-white/50 hover:text-white hover:bg-white/10"
            onClick={handleUndo}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Modifier
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-white/50">
            {setNumber}
          </div>
          {lastPerf && (
            <span className="text-xs text-violet-400 bg-violet-500/20 px-2 py-1 rounded-full">
              Dernier: {lastPerf.reps}×{lastPerf.weight}kg
            </span>
          )}
        </div>

        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-400/60 hover:text-red-400 hover:bg-red-500/20"
            onClick={onDelete}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Main inputs */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Reps */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Répétitions</label>
          <input
            ref={repsInputRef}
            type="number"
            inputMode="numeric"
            value={editingField === "reps" ? reps : reps}
            onChange={(e) => {
              setReps(parseInt(e.target.value) || 0);
            }}
            onFocus={() => setEditingField("reps")}
            onBlur={() => setEditingField(null)}
            onClick={handleRepsClick}
            className="w-full text-center h-14 text-2xl font-bold bg-white/10 border-2 border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          {/* Reps presets */}
          <div className="flex gap-1 mt-2">
            {REPS_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setReps(preset);
                  setSaved(false);
                }}
                className={cn(
                  "flex-1 py-1.5 text-sm font-medium rounded-lg transition-all",
                  reps === preset
                    ? "bg-violet-500 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                )}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Weight */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Poids (kg)</label>
          <input
            ref={weightInputRef}
            type="number"
            inputMode="decimal"
            value={editingField === "weight" ? weight : weight}
            onChange={(e) => {
              setWeight(parseFloat(e.target.value) || 0);
            }}
            onFocus={() => setEditingField("weight")}
            onBlur={() => setEditingField(null)}
            onClick={handleWeightClick}
            step="0.5"
            className="w-full text-center h-14 text-2xl font-bold bg-white/10 border-2 border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          {/* Weight adjustments */}
          <div className="flex gap-1 mt-2">
            {WEIGHT_ADJUSTMENTS.map((delta) => (
              <button
                key={delta}
                onClick={() => adjustWeight(delta)}
                className={cn(
                  "flex-1 py-1.5 text-sm font-medium rounded-lg transition-all",
                  "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
                  delta > 0 ? "text-emerald-400" : "text-red-400"
                )}
              >
                {delta > 0 ? "+" : ""}{delta}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save button */}
      <Button
        className="w-full h-12 rounded-xl font-semibold text-base bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
        onClick={handleSave}
      >
        <Check className="h-5 w-5 mr-2" />
        Valider la série
      </Button>
    </div>
  );
}
