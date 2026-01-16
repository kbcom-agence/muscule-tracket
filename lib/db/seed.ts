import "dotenv/config";
import { db, sessions, exercises } from "./index";

const defaultSessions = [
  {
    name: "Push",
    order: 0,
    exercises: [
      { name: "Bench Press", targetSets: 4 },
      { name: "Incline Dumbbell Press", targetSets: 3 },
      { name: "Shoulder Press", targetSets: 3 },
      { name: "Lateral Raises", targetSets: 3 },
      { name: "Triceps Pushdown", targetSets: 3 },
    ],
  },
  {
    name: "Pull",
    order: 1,
    exercises: [
      { name: "Deadlift", targetSets: 4 },
      { name: "Pull-ups", targetSets: 3 },
      { name: "Barbell Row", targetSets: 3 },
      { name: "Face Pulls", targetSets: 3 },
      { name: "Biceps Curls", targetSets: 3 },
    ],
  },
  {
    name: "Legs",
    order: 2,
    exercises: [
      { name: "Squat", targetSets: 4 },
      { name: "Romanian Deadlift", targetSets: 3 },
      { name: "Leg Press", targetSets: 3 },
      { name: "Leg Curl", targetSets: 3 },
      { name: "Calf Raises", targetSets: 4 },
    ],
  },
  {
    name: "Upper",
    order: 3,
    exercises: [
      { name: "Overhead Press", targetSets: 4 },
      { name: "Weighted Pull-ups", targetSets: 3 },
      { name: "Dumbbell Bench", targetSets: 3 },
      { name: "Cable Row", targetSets: 3 },
      { name: "Dips", targetSets: 3 },
    ],
  },
];

async function seed() {
  console.log("Seeding database...");

  for (const sessionData of defaultSessions) {
    const [session] = await db
      .insert(sessions)
      .values({
        name: sessionData.name,
        order: sessionData.order,
      })
      .returning();

    console.log(`Created session: ${session.name}`);

    for (let i = 0; i < sessionData.exercises.length; i++) {
      const exerciseData = sessionData.exercises[i];
      await db.insert(exercises).values({
        sessionId: session.id,
        name: exerciseData.name,
        targetSets: exerciseData.targetSets,
        order: i,
      });
      console.log(`  - Added exercise: ${exerciseData.name}`);
    }
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
