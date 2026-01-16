"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, GripVertical, Loader2, Settings, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Exercise {
  id: string;
  name: string;
  targetSets: number;
  order: number;
}

interface Session {
  id: string;
  name: string;
  order: number;
  exercises: Exercise[];
}

export default function SettingsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [exerciseDialogOpen, setExerciseDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const [sessionName, setSessionName] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [targetSets, setTargetSets] = useState(3);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        if (data.length > 0 && !selectedSession) {
          setSelectedSession(data[0]);
        }
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const openSessionDialog = (session?: Session) => {
    if (session) {
      setEditingSession(session);
      setSessionName(session.name);
    } else {
      setEditingSession(null);
      setSessionName("");
    }
    setSessionDialogOpen(true);
  };

  const saveSession = async () => {
    if (!sessionName.trim()) return;

    try {
      if (editingSession) {
        await fetch(`/api/sessions/${editingSession.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: sessionName }),
        });
      } else {
        await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: sessionName, order: sessions.length }),
        });
      }
      setSessionDialogOpen(false);
      loadSessions();
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  const deleteSession = async (session: Session) => {
    if (!confirm(`Supprimer la séance "${session.name}" et tous ses exercices ?`)) return;

    try {
      await fetch(`/api/sessions/${session.id}`, { method: "DELETE" });
      if (selectedSession?.id === session.id) {
        setSelectedSession(null);
      }
      loadSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const openExerciseDialog = (exercise?: Exercise) => {
    if (exercise) {
      setEditingExercise(exercise);
      setExerciseName(exercise.name);
      setTargetSets(exercise.targetSets);
    } else {
      setEditingExercise(null);
      setExerciseName("");
      setTargetSets(3);
    }
    setExerciseDialogOpen(true);
  };

  const saveExercise = async () => {
    if (!exerciseName.trim() || !selectedSession) return;

    try {
      if (editingExercise) {
        await fetch(`/api/exercises/${editingExercise.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: exerciseName, targetSets }),
        });
      } else {
        await fetch("/api/exercises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: selectedSession.id,
            name: exerciseName,
            targetSets,
            order: selectedSession.exercises.length,
          }),
        });
      }
      setExerciseDialogOpen(false);
      loadSessions();
    } catch (error) {
      console.error("Error saving exercise:", error);
    }
  };

  const deleteExercise = async (exercise: Exercise) => {
    if (!confirm(`Supprimer l'exercice "${exercise.name}" ?`)) return;

    try {
      await fetch(`/api/exercises/${exercise.id}`, { method: "DELETE" });
      loadSessions();
    } catch (error) {
      console.error("Error deleting exercise:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-violet-500 mx-auto mb-4" />
          <p className="text-white/50">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto pb-28">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/30">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Réglages</h1>
            <p className="text-white/50 text-sm">Gérer tes séances</p>
          </div>
        </div>
      </header>

      {/* Sessions section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Séances</h2>
          <Button size="sm" onClick={() => openSessionDialog()}>
            <Plus className="w-4 h-4 mr-1" />
            Ajouter
          </Button>
        </div>

        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`glass-card p-4 cursor-pointer transition-all ${
                selectedSession?.id === session.id
                  ? "ring-2 ring-violet-500/50"
                  : ""
              }`}
              onClick={() => setSelectedSession(session)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-white/30" />
                  <div>
                    <p className="font-medium text-white">{session.name}</p>
                    <p className="text-sm text-white/50">
                      {session.exercises.length} exercice{session.exercises.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={(e) => {
                      e.stopPropagation();
                      openSessionDialog(session);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {sessions.length === 0 && (
            <div className="glass-card p-8 text-center">
              <p className="text-white/50">Aucune séance. Clique sur Ajouter pour commencer.</p>
            </div>
          )}
        </div>
      </section>

      {/* Exercises section */}
      {selectedSession && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">
              Exercices - {selectedSession.name}
            </h2>
            <Button size="sm" onClick={() => openExerciseDialog()}>
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </Button>
          </div>

          <div className="space-y-2">
            {selectedSession.exercises.map((exercise, index) => (
              <div key={exercise.id} className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{exercise.name}</p>
                      <p className="text-sm text-white/50">
                        {exercise.targetSets} séries
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => openExerciseDialog(exercise)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      onClick={() => deleteExercise(exercise)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {selectedSession.exercises.length === 0 && (
              <div className="glass-card p-8 text-center">
                <Dumbbell className="w-10 h-10 text-violet-400/50 mx-auto mb-3" />
                <p className="text-white/50">Aucun exercice dans cette séance.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Session Dialog */}
      <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSession ? "Modifier la séance" : "Nouvelle séance"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="session-name">Nom de la séance</Label>
            <Input
              id="session-name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Ex: Push, Pull, Legs..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSessionDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveSession}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exercise Dialog */}
      <Dialog open={exerciseDialogOpen} onOpenChange={setExerciseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingExercise ? "Modifier l exercice" : "Nouvel exercice"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="exercise-name">Nom de l exercice</Label>
              <Input
                id="exercise-name"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="Ex: Bench Press, Squat..."
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="target-sets">Séries cibles</Label>
              <Input
                id="target-sets"
                type="number"
                value={targetSets}
                onChange={(e) => setTargetSets(parseInt(e.target.value) || 3)}
                min={1}
                max={10}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExerciseDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveExercise}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
