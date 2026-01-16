import { NextRequest, NextResponse } from "next/server";
import { db, workouts } from "@/lib/db";
import { desc } from "drizzle-orm";

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

    const [newWorkout] = await db
      .insert(workouts)
      .values({ sessionId, date: today, notes })
      .returning();

    return NextResponse.json(newWorkout, { status: 201 });
  } catch (error) {
    console.error("Error creating workout:", error);
    return NextResponse.json({ error: "Failed to create workout" }, { status: 500 });
  }
}
