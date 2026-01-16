import { notFound } from "next/navigation";
import Link from "next/link";
import { db, workouts, sets } from "@/lib/db";
import { eq } from "drizzle-orm";
import { ArrowLeft, Calendar, Dumbbell, TrendingUp, Target } from "lucide-react";
import { formatDateLong, calculateVolume, getMaxWeight } from "@/lib/utils";
import { DeleteWorkoutButton } from "./DeleteWorkoutButton";

interface Props {
  params: { id: string };
}

async function getWorkout(id: string) {
  try {
    const workout = await db.query.workouts.findFirst({
      where: eq(workouts.id, id),
      with: {
        session: true,
        sets: {
          orderBy: [sets.setNumber],
        },
      },
    });

    if (!workout) return null;

    const exerciseList = await db.query.exercises.findMany();
    const exerciseMap = Object.fromEntries(exerciseList.map((e) => [e.id, e]));

    return {
      ...workout,
      exerciseMap,
    };
  } catch {
    return null;
  }
}

export default async function WorkoutDetailPage({ params }: Props) {
  const workout = await getWorkout(params.id);

  if (!workout) {
    notFound();
  }

  const setsByExercise: Record<string, typeof workout.sets> = {};
  workout.sets.forEach((set) => {
    if (!setsByExercise[set.exerciseId]) {
      setsByExercise[set.exerciseId] = [];
    }
    setsByExercise[set.exerciseId].push(set);
  });

  const totalVolume = calculateVolume(workout.sets);
  const maxWeight = getMaxWeight(workout.sets);

  return (
    <div className="px-4 py-6 max-w-lg mx-auto pb-28">
      <header className="mb-6">
        <Link
          href="/history"
          className="inline-flex items-center text-white/50 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Historique
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/30">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{workout.session.name}</h1>
            <div className="flex items-center gap-1 text-white/50 text-sm mt-1">
              <Calendar className="w-4 h-4" />
              {formatDateLong(workout.date)}
            </div>
          </div>
        </div>
      </header>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card p-4 text-center">
          <Target className="w-5 h-5 text-violet-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{workout.sets.length}</p>
          <p className="text-xs text-white/50">Séries</p>
        </div>
        <div className="glass-card p-4 text-center">
          <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{totalVolume.toLocaleString()}</p>
          <p className="text-xs text-white/50">Volume (kg)</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Dumbbell className="w-5 h-5 text-orange-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{maxWeight}</p>
          <p className="text-xs text-white/50">Max (kg)</p>
        </div>
      </div>

      {/* Exercises detail */}
      <section className="space-y-4 mb-8">
        {Object.entries(setsByExercise).map(([exerciseId, exerciseSets]) => {
          const exercise = workout.exerciseMap[exerciseId];
          const exerciseVolume = calculateVolume(exerciseSets);
          const exerciseMax = getMaxWeight(exerciseSets);

          return (
            <div key={exerciseId} className="glass-card overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">
                      {exercise?.name || "Exercice supprimé"}
                    </h3>
                    <p className="text-sm text-white/50">
                      {exerciseSets.length} séries - {exerciseVolume}kg - max {exerciseMax}kg
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {exerciseSets.map((set) => (
                  <div
                    key={set.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm">
                        {set.setNumber}
                      </span>
                      <span className="font-medium text-white">
                        {set.weight} kg x {set.reps}
                      </span>
                    </div>
                    <span className="text-sm text-white/40">
                      {set.weight * set.reps} kg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {workout.notes && (
        <div className="glass-card p-4 mb-8">
          <h3 className="font-medium text-white mb-2">Notes</h3>
          <p className="text-white/60">{workout.notes}</p>
        </div>
      )}

      <DeleteWorkoutButton workoutId={workout.id} />
    </div>
  );
}
