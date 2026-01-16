import { NextRequest, NextResponse } from "next/server";
import { db, exercises } from "@/lib/db";
import { eq } from "drizzle-orm";

interface Props {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const exercise = await db.query.exercises.findFirst({
      where: eq(exercises.id, params.id),
    });

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error("Error fetching exercise:", error);
    return NextResponse.json({ error: "Failed to fetch exercise" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const body = await request.json();
    const { name, order, targetSets } = body;

    const [updated] = await db
      .update(exercises)
      .set({ name, order, targetSets })
      .where(eq(exercises.id, params.id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating exercise:", error);
    return NextResponse.json({ error: "Failed to update exercise" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const [deleted] = await db
      .delete(exercises)
      .where(eq(exercises.id, params.id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting exercise:", error);
    return NextResponse.json({ error: "Failed to delete exercise" }, { status: 500 });
  }
}
