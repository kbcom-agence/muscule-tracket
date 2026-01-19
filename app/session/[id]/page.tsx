import { notFound } from "next/navigation";
import Link from "next/link";
import { db, sessions, exercises, workouts } from "@/lib/db";
import { eq, desc, and } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Dumbbell, Zap, RefreshCw } from "lucide-react";

interface Props {
  params: { id: string };
}

async function getSession(id: string) {
  try {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, id),
      with: {
        exercises: {
          orderBy: [exercises.order],
        },
      },
    });
    return session;
  } catch {
    return null;
  }
}

async function getLastWorkout(sessionId: string) {
  try {
    const workout = await db.query.workouts.findFirst({
      where: eq(workouts.sessionId, sessionId),
      orderBy: [desc(workouts.date)],
      with: {
        sets: true,
      },
    });
    return workout;
  } catch {
    return null;
  }
}

async function getTodayWorkout(sessionId: string) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const workout = await db.query.workouts.findFirst({
      where: and(
        eq(workouts.sessionId, sessionId),
        eq(workouts.date, today)
      ),
      with: {
        sets: true,
      },
    });
    return workout;
  } catch {
    return null;
  }
}

export default async function SessionPage({ params }: Props) {
  const [session, lastWorkout, todayWorkout] = await Promise.all([
    getSession(params.id),
    getLastWorkout(params.id),
    getTodayWorkout(params.id),
  ]);

  if (!session) {
    notFound();
  }

  const lastPerfByExercise: Record<string, { reps: number; weight: number }[]> = {};
  if (lastWorkout) {
    lastWorkout.sets.forEach((set) => {
      if (!lastPerfByExercise[set.exerciseId]) {
        lastPerfByExercise[set.exerciseId] = [];
      }
      lastPerfByExercise[set.exerciseId].push({
        reps: set.reps,
        weight: set.weight,
      });
    });
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto pb-28">
      <header className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-white/50 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/30">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{session.name}</h1>
            <p className="text-white/50">
              {session.exercises.length} exercice{session.exercises.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </header>

      {session.exercises.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-white/60 mb-4">
            Aucun exercice dans cette séance
          </p>
          <Link href="/settings" className="text-violet-400 hover:text-violet-300">
            Ajouter des exercices
          </Link>
        </div>
      ) : (
        <>
          <section className="space-y-3 mb-8">
            {session.exercises.map((exercise, index) => {
              const lastPerf = lastPerfByExercise[exercise.id];
              return (
                <div key={exercise.id} className="glass-card p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-violet-400 font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{exercise.name}</h3>
                      <p className="text-sm text-white/50">
                        {exercise.targetSets} séries
                      </p>
                    </div>
                    {lastPerf && lastPerf[0] && (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-violet-400">
                          {lastPerf[0].weight} kg
                        </p>
                        <p className="text-xs text-white/40">
                          x {lastPerf[0].reps} reps
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>

          {todayWorkout && todayWorkout.sets.length > 0 ? (
            <div className="space-y-3">
              <div className="glass-card p-4 border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-emerald-400 font-medium">Séance en cours</p>
                    <p className="text-sm text-white/50">
                      {todayWorkout.sets.length} série{todayWorkout.sets.length !== 1 ? "s" : ""} enregistrée{todayWorkout.sets.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
              <Link href={`/session/${session.id}/workout`}>
                <Button size="xl" className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                  <Play className="w-5 h-5 mr-2" />
                  Reprendre la séance
                </Button>
              </Link>
            </div>
          ) : (
            <Link href={`/session/${session.id}/workout`}>
              <Button size="xl" className="w-full">
                <Zap className="w-5 h-5 mr-2" />
                Démarrer la séance
              </Button>
            </Link>
          )}
        </>
      )}
    </div>
  );
}
