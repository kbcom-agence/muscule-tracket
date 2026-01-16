import { NextRequest, NextResponse } from "next/server";
import { db, workouts, sets } from "@/lib/db";
import { eq } from "drizzle-orm";

interface Props {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const workout = await db.query.workouts.findFirst({
      where: eq(workouts.id, params.id),
      with: {
        session: true,
        sets: {
          orderBy: [sets.setNumber],
        },
      },
    });

    if (!workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    // Get all exercises
    const exerciseList = await db.query.exercises.findMany();

    const exerciseMap = Object.fromEntries(
      exerciseList.map((e) => [e.id, e])
    );

    // Group sets by exercise
    const setsWithExercise = workout.sets.map((set) => ({
      ...set,
      exercise: exerciseMap[set.exerciseId],
    }));

    return NextResponse.json({
      ...workout,
      sets: setsWithExercise,
    });
  } catch (error) {
    console.error("Error fetching workout:", error);
    return NextResponse.json({ error: "Failed to fetch workout" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const body = await request.json();
    const { notes } = body;

    const [updated] = await db
      .update(workouts)
      .set({ notes })
      .where(eq(workouts.id, params.id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating workout:", error);
    return NextResponse.json({ error: "Failed to update workout" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const [deleted] = await db
      .delete(workouts)
      .where(eq(workouts.id, params.id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workout:", error);
    return NextResponse.json({ error: "Failed to delete workout" }, { status: 500 });
  }
}
