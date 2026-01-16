"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  workoutId: string;
}

export function DeleteWorkoutButton({ workoutId }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Supprimer cette séance ?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/workouts/${workoutId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/history");
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting workout:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Button
      variant="destructive"
      className="w-full"
      onClick={handleDelete}
      disabled={deleting}
    >
      {deleting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4 mr-2" />
      )}
      Supprimer cette séance
    </Button>
  );
}
