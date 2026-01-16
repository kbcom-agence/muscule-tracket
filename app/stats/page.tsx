"use client";

import { useState, useEffect } from "react";
import { Loader2, Dumbbell, BarChart3, TrendingUp, Trophy } from "lucide-react";
import { ProgressChart } from "@/components/ProgressChart";

interface Exercise {
  id: string;
  name: string;
  session: {
    name: string;
  };
  sets: { weight: number }[];
}

interface ProgressionData {
  date: string;
  weight: number;
  volume: number;
}

interface ExerciseStats {
  exercise: Exercise;
  progression: ProgressionData[];
}

export default function StatsPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [stats, setStats] = useState<ExerciseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    if (selectedExercise) {
      loadStats(selectedExercise);
    }
  }, [selectedExercise]);

  const loadExercises = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setExercises(data);
        if (data.length > 0) {
          setSelectedExercise(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (exerciseId: string) => {
    setLoadingStats(true);
    try {
      const res = await fetch(`/api/stats?exerciseId=${exerciseId}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoadingStats(false);
    }
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

  return (
    <div className="px-4 py-6 max-w-lg mx-auto pb-28">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/30">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Statistiques</h1>
            <p className="text-white/50 text-sm">Suis ta progression</p>
          </div>
        </div>
      </header>

      {exercises.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <BarChart3 className="w-12 h-12 text-violet-400/50 mx-auto mb-4" />
          <p className="text-white/60">
            Aucune donnée disponible
          </p>
          <p className="text-white/40 text-sm mt-2">
            Enregistre quelques séances pour voir tes stats
          </p>
        </div>
      ) : (
        <>
          {/* Exercise selector */}
          <section className="mb-6">
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">
              Exercice
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className={`glass-card p-3 cursor-pointer transition-all ${
                    selectedExercise === exercise.id
                      ? "ring-2 ring-violet-500/50"
                      : ""
                  }`}
                  onClick={() => setSelectedExercise(exercise.id)}
                >
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-white truncate">
                        {exercise.name}
                      </p>
                      <p className="text-xs text-white/50">
                        {exercise.session.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Charts */}
          {loadingStats ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          ) : stats ? (
            <section className="space-y-4">
              <ProgressChart
                title="Poids max (kg)"
                data={stats.progression}
                dataKey="weight"
                color="#8b5cf6"
              />
              <ProgressChart
                title="Volume total (kg)"
                data={stats.progression}
                dataKey="volume"
                color="#10b981"
              />

              {stats.progression.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Records
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-sm text-white/50 mb-1">Poids max</p>
                      <p className="text-2xl font-bold text-violet-400">
                        {Math.max(...stats.progression.map((p) => p.weight))} kg
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-sm text-white/50 mb-1">Volume max</p>
                      <p className="text-2xl font-bold text-emerald-400">
                        {Math.max(...stats.progression.map((p) => p.volume)).toLocaleString()} kg
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-sm text-white/50 mb-1">Séances</p>
                      <p className="text-2xl font-bold text-white">
                        {stats.progression.length}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-sm text-white/50 mb-1">Dernier poids</p>
                      <p className="text-2xl font-bold text-white">
                        {stats.progression[stats.progression.length - 1]?.weight || 0} kg
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
