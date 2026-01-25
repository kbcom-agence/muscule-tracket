import { NextRequest, NextResponse } from "next/server";
import { db, workouts } from "@/lib/db";
import { eq } from "drizzle-orm";

interface Props {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    // Get all completed workouts for this session with their sets
    const allWorkouts = await db.query.workouts.findMany({
      where: eq(workouts.sessionId, params.id),
      with: {
        sets: true,
      },
    });

    // Filter only completed workouts (have completedAt)
    const completedWorkouts = allWorkouts.filter(w => w.completedAt !== null);

    if (completedWorkouts.length === 0) {
      return NextResponse.json({});
    }

    // Find best performance (highest weight) for each exercise
    // For progressive overload, we want the best weight achieved at each set position
    const bestByExercise: Record<string, { reps: number; weight: number }[]> = {};

    completedWorkouts.forEach((workout) => {
      workout.sets.forEach((set) => {
        if (!bestByExercise[set.exerciseId]) {
          bestByExercise[set.exerciseId] = [];
        }

        const setIndex = set.setNumber - 1;
        const current = bestByExercise[set.exerciseId][setIndex];

        // Keep the best weight for each set position
        // If same weight, prefer more reps
        if (!current ||
            set.weight > current.weight ||
            (set.weight === current.weight && set.reps > current.reps)) {
          bestByExercise[set.exerciseId][setIndex] = {
            reps: set.reps,
            weight: set.weight,
          };
        }
      });
    });

    // Fill gaps with null and clean up sparse arrays
    Object.keys(bestByExercise).forEach((exerciseId) => {
      const arr = bestByExercise[exerciseId];
      for (let i = 0; i < arr.length; i++) {
        if (!arr[i]) {
          arr[i] = { reps: 0, weight: 0 };
        }
      }
    });

    return NextResponse.json(bestByExercise);
  } catch (error) {
    console.error("Error fetching best performance:", error);
    return NextResponse.json({ error: "Failed to fetch best performance" }, { status: 500 });
  }
}
