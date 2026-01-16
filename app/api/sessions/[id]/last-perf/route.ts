import { NextRequest, NextResponse } from "next/server";
import { db, workouts, sets } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

interface Props {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    // Get the last workout for this session
    const lastWorkout = await db.query.workouts.findFirst({
      where: eq(workouts.sessionId, params.id),
      orderBy: [desc(workouts.date)],
      with: {
        sets: {
          orderBy: [sets.setNumber],
        },
      },
    });

    if (!lastWorkout) {
      return NextResponse.json({});
    }

    // Group sets by exercise
    const perfByExercise: Record<string, { reps: number; weight: number }[]> = {};
    lastWorkout.sets.forEach((set) => {
      if (!perfByExercise[set.exerciseId]) {
        perfByExercise[set.exerciseId] = [];
      }
      perfByExercise[set.exerciseId].push({
        reps: set.reps,
        weight: set.weight,
      });
    });

    return NextResponse.json(perfByExercise);
  } catch (error) {
    console.error("Error fetching last performance:", error);
    return NextResponse.json({ error: "Failed to fetch last performance" }, { status: 500 });
  }
}
