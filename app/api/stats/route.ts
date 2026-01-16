import { NextRequest, NextResponse } from "next/server";
import { db, exercises, sets, workouts } from "@/lib/db";
import { eq, desc, asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const exerciseId = searchParams.get("exerciseId");

    if (!exerciseId) {
      // Return all exercises with their stats
      const allExercises = await db.query.exercises.findMany({
        with: {
          session: true,
          sets: {
            orderBy: [desc(sets.createdAt)],
            limit: 1,
          },
        },
      });

      return NextResponse.json(allExercises);
    }

    // Get progression data for a specific exercise
    const exercise = await db.query.exercises.findFirst({
      where: eq(exercises.id, exerciseId),
    });

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    // Get all sets for this exercise, grouped by workout
    const allSets = await db.query.sets.findMany({
      where: eq(sets.exerciseId, exerciseId),
      with: {
        workout: true,
      },
      orderBy: [asc(sets.createdAt)],
    });

    // Group by workout date and calculate max weight and total volume
    const dataByDate: Record<string, { maxWeight: number; totalVolume: number; date: string }> = {};

    allSets.forEach((set) => {
      const date = set.workout.date;
      if (!dataByDate[date]) {
        dataByDate[date] = { maxWeight: 0, totalVolume: 0, date };
      }
      dataByDate[date].maxWeight = Math.max(dataByDate[date].maxWeight, set.weight);
      dataByDate[date].totalVolume += set.weight * set.reps;
    });

    const progression = Object.values(dataByDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((d) => ({
        date: new Date(d.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
        weight: d.maxWeight,
        volume: d.totalVolume,
      }));

    return NextResponse.json({
      exercise,
      progression,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
