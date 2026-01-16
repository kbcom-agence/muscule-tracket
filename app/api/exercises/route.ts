import { NextRequest, NextResponse } from "next/server";
import { db, exercises } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    let query = db.query.exercises.findMany({
      orderBy: [exercises.order],
    });

    if (sessionId) {
      const exerciseList = await db.query.exercises.findMany({
        where: eq(exercises.sessionId, sessionId),
        orderBy: [exercises.order],
      });
      return NextResponse.json(exerciseList);
    }

    const allExercises = await query;
    return NextResponse.json(allExercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json({ error: "Failed to fetch exercises" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, name, order = 0, targetSets = 3 } = body;

    if (!sessionId || !name) {
      return NextResponse.json(
        { error: "sessionId and name are required" },
        { status: 400 }
      );
    }

    const [newExercise] = await db
      .insert(exercises)
      .values({ sessionId, name, order, targetSets })
      .returning();

    return NextResponse.json(newExercise, { status: 201 });
  } catch (error) {
    console.error("Error creating exercise:", error);
    return NextResponse.json({ error: "Failed to create exercise" }, { status: 500 });
  }
}
