import { db, sessions, workouts } from "@/lib/db";
import { desc } from "drizzle-orm";
import { SessionCard } from "@/components/SessionCard";
import { WorkoutSummary } from "@/components/WorkoutSummary";
import { formatDate } from "@/lib/utils";
import { Dumbbell, Flame } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getSessions() {
  try {
    const allSessions = await db.query.sessions.findMany({
      with: {
        exercises: true,
        workouts: {
          orderBy: [desc(workouts.date)],
          limit: 1,
        },
      },
      orderBy: [sessions.order],
    });
    return allSessions;
  } catch {
    return [];
  }
}

async function getRecentWorkouts() {
  try {
    const recentWorkouts = await db.query.workouts.findMany({
      with: {
        session: true,
        sets: true,
      },
      orderBy: [desc(workouts.date)],
      limit: 5,
    });
    return recentWorkouts;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [sessionsList, recentWorkouts] = await Promise.all([
    getSessions(),
    getRecentWorkouts(),
  ]);

  return (
    <div className="px-4 py-6 max-w-lg mx-auto pb-28">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/30">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Muscu Tracker</h1>
            <p className="text-white/50 text-sm">Prêt à t entraîner ?</p>
          </div>
        </div>
      </header>

      {/* Sessions */}
      {sessionsList.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Dumbbell className="w-12 h-12 text-violet-400 mx-auto mb-4" />
          <p className="text-white/60 mb-4">
            Aucune séance configurée
          </p>
          <a
            href="/settings"
            className="text-violet-400 hover:text-violet-300 font-medium"
          >
            Créer ta première séance
          </a>
        </div>
      ) : (
        <section className="space-y-3 mb-8">
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Tes séances
          </h2>
          {sessionsList.map((session) => (
            <SessionCard
              key={session.id}
              id={session.id}
              name={session.name}
              exerciseCount={session.exercises.length}
              lastWorkoutDate={
                session.workouts[0]
                  ? formatDate(session.workouts[0].date)
                  : undefined
              }
            />
          ))}
        </section>
      )}

      {/* Recent workouts */}
      {recentWorkouts.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">
            Dernières séances
          </h2>
          <div className="space-y-2">
            {recentWorkouts.map((workout) => {
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
      )}
    </div>
  );
}
