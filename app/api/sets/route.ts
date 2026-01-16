import { NextRequest, NextResponse } from "next/server";
import { db, sets } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workoutId, exerciseId, setNumber, reps, weight } = body;

    if (!workoutId || !exerciseId || setNumber === undefined || reps === undefined || weight === undefined) {
      return NextResponse.json(
        { error: "workoutId, exerciseId, setNumber, reps, and weight are required" },
        { status: 400 }
      );
    }

    // Check if a set with this workout, exercise, and setNumber already exists
    const existingSet = await db.query.sets.findFirst({
      where: and(
        eq(sets.workoutId, workoutId),
        eq(sets.exerciseId, exerciseId),
        eq(sets.setNumber, setNumber)
      ),
    });

    if (existingSet) {
      // Update existing set
      const [updated] = await db
        .update(sets)
        .set({ reps, weight })
        .where(eq(sets.id, existingSet.id))
        .returning();
      return NextResponse.json(updated);
    }

    // Create new set
    const [newSet] = await db
      .insert(sets)
      .values({ workoutId, exerciseId, setNumber, reps, weight })
      .returning();

    return NextResponse.json(newSet, { status: 201 });
  } catch (error) {
    console.error("Error saving set:", error);
    return NextResponse.json({ error: "Failed to save set" }, { status: 500 });
  }
}
