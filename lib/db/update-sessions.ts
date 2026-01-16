import "dotenv/config";
import { db, sessions, exercises } from "./index";
import { sql } from "drizzle-orm";

const myProgram = [
  {
    name: "Torse A",
    order: 0,
    exercises: [
      { name: "Développé Incliné Smith Machine", targetSets: 3 },
      { name: "Tirage Vertical Large", targetSets: 3 },
      { name: "Chest Press Machine", targetSets: 3 },
      { name: "Rowing Câble Prise Neutre", targetSets: 3 },
      { name: "Élévations Latérales Machine", targetSets: 3 },
    ],
  },
  {
    name: "Membres A",
    order: 1,
    exercises: [
      { name: "Leg Curl Assis", targetSets: 3 },
      { name: "Hack Squat", targetSets: 3 },
      { name: "Leg Extension", targetSets: 3 },
      { name: "Curl Corde Poulie Basse", targetSets: 3 },
      { name: "Extension Overhead Câble", targetSets: 3 },
    ],
  },
  {
    name: "Torse B",
    order: 2,
    exercises: [
      { name: "Développé Épaules Machine", targetSets: 3 },
      { name: "Tirage Vertical Supination", targetSets: 3 },
      { name: "Chest Press Machine", targetSets: 3 },
      { name: "Straight-Arm Pulldown", targetSets: 3 },
      { name: "Face Pulls", targetSets: 3 },
    ],
  },
  {
    name: "Membres B",
    order: 3,
    exercises: [
      { name: "Presse à Cuisses", targetSets: 3 },
      { name: "Leg Extension", targetSets: 3 },
      { name: "Extension Overhead Câble", targetSets: 3 },
      { name: "Curl Marteau Haltères", targetSets: 3 },
      { name: "Curl Biceps Poulie", targetSets: 3 },
    ],
  },
];

async function updateSessions() {
  console.log("Suppression des anciennes séances...");

  // Delete all existing data
  await db.delete(exercises);
  await db.delete(sessions);

  console.log("Création de tes séances...\n");

  for (const sessionData of myProgram) {
    const [session] = await db
      .insert(sessions)
      .values({
        name: sessionData.name,
        order: sessionData.order,
      })
      .returning();

    console.log(`✓ ${session.name}`);

    for (let i = 0; i < sessionData.exercises.length; i++) {
      const exerciseData = sessionData.exercises[i];
      await db.insert(exercises).values({
        sessionId: session.id,
        name: exerciseData.name,
        targetSets: exerciseData.targetSets,
        order: i,
      });
      console.log(`  ${i + 1}. ${exerciseData.name}`);
    }
    console.log("");
  }

  console.log("Mise à jour terminée !");
  process.exit(0);
}

updateSessions().catch(console.error);
