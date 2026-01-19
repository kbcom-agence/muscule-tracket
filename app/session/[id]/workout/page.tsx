"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, Trophy, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExerciseLogger } from "@/components/ExerciseLogger";

interface Exercise {
  id: string;
  name: string;
  targetSets: number;
}

interface Session {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface SetData {
  id?: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight: number;
}

interface LastPerf {
  [exerciseId: string]: { reps: number; weight: number }[];
}

interface ExistingSets {
  [exerciseId: string]: SetData[];
}

export default function WorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [lastPerf, setLastPerf] = useState<LastPerf>({});
  const [existingSets, setExistingSets] = useState<ExistingSets>({});
  const [sets, setSets] = useState<SetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResuming, setIsResuming] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);

        const sessionRes = await fetch(`/api/sessions/${sessionId}`);
        if (!sessionRes.ok) throw new Error("Session not found");
        const sessionData = await sessionRes.json();
        setSession(sessionData);

        const lastPerfRes = await fetch(`/api/sessions/${sessionId}/last-perf`);
        if (lastPerfRes.ok) {
          const lastPerfData = await lastPerfRes.json();
          setLastPerf(lastPerfData);
        }

        const workoutRes = await fetch("/api/workouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (!workoutRes.ok) {
          throw new Error("Impossible de créer/reprendre la séance");
        }

        const workoutData = await workoutRes.json();
        setWorkoutId(workoutData.id);

        // Check if we're resuming an existing workout with sets
        if (workoutData.sets && workoutData.sets.length > 0) {
          setIsResuming(true);
          // Group existing sets by exercise
          const groupedSets: ExistingSets = {};
          workoutData.sets.forEach((set: SetData) => {
            if (!groupedSets[set.exerciseId]) {
              groupedSets[set.exerciseId] = [];
            }
            groupedSets[set.exerciseId].push(set);
          });
          setExistingSets(groupedSets);
          setSets(workoutData.sets);
        }
      } catch (err) {
        console.error("Error loading workout data:", err);
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sessionId]);

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSetSave = useCallback(
    async (exerciseId: string, setNumber: number, reps: number, weight: number) => {
      if (!workoutId) {
        setSaveError("Séance non initialisée. Rafraîchis la page.");
        return;
      }

      setSaveError(null);
      const newSet: SetData = { exerciseId, setNumber, reps, weight };
      setSets((prev) => {
        const existing = prev.findIndex(
          (s) => s.exerciseId === exerciseId && s.setNumber === setNumber
        );
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = newSet;
          return updated;
        }
        return [...prev, newSet];
      });

      try {
        const res = await fetch("/api/sets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workoutId,
            exerciseId,
            setNumber,
            reps,
            weight,
          }),
        });

        if (!res.ok) {
          throw new Error("Erreur de sauvegarde");
        }
      } catch (err) {
        console.error("Error saving set:", err);
        setSaveError("Erreur lors de la sauvegarde. Réessaie.");
      }
    },
    [workoutId]
  );

  const handleFinish = async () => {
    if (sets.length === 0) {
      if (workoutId) {
        await fetch(`/api/workouts/${workoutId}`, { method: "DELETE" });
      }
      router.push("/");
      return;
    }

    setSaving(true);

    // Mark workout as completed
    if (workoutId) {
      await fetch(`/api/workouts/${workoutId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });
    }

    router.push(`/history/${workoutId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-violet-500 mx-auto mb-4" />
          <p className="text-white/50">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="px-4 py-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-white/60 mb-4">{error || "Séance non trouvée"}</p>
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
          <Link href="/" className="text-violet-400 hover:text-violet-300 flex items-center">
            Retour à l accueil
          </Link>
        </div>
      </div>
    );
  }

  const totalExercises = session.exercises.length;
  const exercisesWithSets = new Set(sets.map((s) => s.exerciseId)).size;
  const progress = (exercisesWithSets / totalExercises) * 100;

  return (
    <div className="px-4 py-6 max-w-lg mx-auto pb-28">
      <header className="mb-6">
        <Link
          href={`/session/${sessionId}`}
          className="inline-flex items-center text-white/50 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Annuler
        </Link>
        <h1 className="text-2xl font-bold text-white">{session.name}</h1>

        {/* Resuming banner */}
        {isResuming && (
          <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
            <RefreshCw className="w-4 h-4" />
            Séance en cours reprise
          </div>
        )}

        {/* Save error banner */}
        {saveError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
            <AlertCircle className="w-4 h-4" />
            {saveError}
          </div>
        )}

        {/* Progress */}
        <div className="mt-4 glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Progression</span>
            <span className="text-violet-400 font-semibold">{sets.length} séries</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <section className="space-y-4 mb-8">
        {session.exercises.map((exercise) => (
          <ExerciseLogger
            key={exercise.id}
            exerciseId={exercise.id}
            exerciseName={exercise.name}
            targetSets={exercise.targetSets}
            lastPerf={lastPerf[exercise.id]}
            initialSets={existingSets[exercise.id]}
            onSetSave={handleSetSave}
          />
        ))}
      </section>

      <Button
        size="xl"
        className="w-full"
        onClick={handleFinish}
        disabled={saving}
      >
        {saving ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <Trophy className="w-5 h-5 mr-2" />
        )}
        Terminer la séance
      </Button>
    </div>
  );
}
