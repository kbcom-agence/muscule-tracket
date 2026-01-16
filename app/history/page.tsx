import { db, workouts } from "@/lib/db";
import { desc } from "drizzle-orm";
import { WorkoutSummary } from "@/components/WorkoutSummary";
import { History, Calendar } from "lucide-react";

async function getWorkouts() {
  try {
    const allWorkouts = await db.query.workouts.findMany({
      with: {
        session: true,
        sets: true,
      },
      orderBy: [desc(workouts.date)],
    });
    return allWorkouts;
  } catch {
    return [];
  }
}

export default async function HistoryPage() {
  const workoutsList = await getWorkouts();

  const workoutsByMonth: Record<string, typeof workoutsList> = {};
  workoutsList.forEach((workout) => {
    const date = new Date(workout.date);
    const monthKey = date.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
    if (!workoutsByMonth[monthKey]) {
      workoutsByMonth[monthKey] = [];
    }
    workoutsByMonth[monthKey].push(workout);
  });

  return (
    <div className="px-4 py-6 max-w-lg mx-auto pb-28">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/30">
            <History className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Historique</h1>
            <p className="text-white/50 text-sm">
              {workoutsList.length} séance{workoutsList.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </header>

      {workoutsList.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Calendar className="w-12 h-12 text-violet-400/50 mx-auto mb-4" />
          <p className="text-white/60">
            Aucune séance enregistrée
          </p>
          <p className="text-white/40 text-sm mt-2">
            Commence un entraînement pour voir ton historique ici
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(workoutsByMonth).map(([month, monthWorkouts]) => (
            <section key={month}>
              <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {month}
              </h2>
              <div className="space-y-2">
                {monthWorkouts.map((workout) => {
                  const uniqueExercises = new Set(
                    workout.sets.map((s) => s.exerciseId)
                  ).size;
                  return (
                    <WorkoutSummary
                      key={workout.id}
                      id={workout.id}
                      sessionName={workout.session.name}
                      date={workout.date}
                      sets={workout.sets}
                      exerciseCount={uniqueExercises}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
