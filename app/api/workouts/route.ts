import { NextRequest, NextResponse } from "next/server";
import { db, workouts } from "@/lib/db";
import { desc, eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const allWorkouts = await db.query.workouts.findMany({
      with: {
        session: true,
        sets: true,
      },
      orderBy: [desc(workouts.date)],
    });
    return NextResponse.json(allWorkouts);
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return NextResponse.json({ error: "Failed to fetch workouts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, notes } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];

    // Check if there's already a workout for this session today (resume feature)
    const existingWorkout = await db.query.workouts.findFirst({
      where: and(
        eq(workouts.sessionId, sessionId),
        eq(workouts.date, today)
      ),
      with: {
        sets: true,
      },
    });

    if (existingWorkout) {
      // Return existing workout with its sets for resuming
      return NextResponse.json(existingWorkout, { status: 200 });
    }

    // Create new workout
    const [newWorkout] = await db
      .insert(workouts)
      .values({ sessionId, date: today, notes })
      .returning();

    return NextResponse.json({ ...newWorkout, sets: [] }, { status: 201 });
  } catch (error) {
    console.error("Error creating workout:", error);
    return NextResponse.json({ error: "Failed to create workout" }, { status: 500 });
  }
}
