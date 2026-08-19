// Sharing a workout has no backend (see functional spec: "avoid
// unnecessary backend complexity") — the workout's name and exercises are
// encoded directly into the URL. Opening that URL decodes them back out;
// there is nothing to look up, so a malformed/tampered link just fails to
// decode rather than 404ing against a server. This does mean the link's
// length scales with the workout's size (more exercises = a longer URL)
// — a handful of characters regardless of content would need a backend
// to look a short code up against, which the spec explicitly says to
// avoid for now.
import type { Workout, WorkoutExercise } from '@/domain/workout';

export type SharedWorkout = {
  name: string;
  exercises: WorkoutExercise[];
};

// Positional array, not keyed JSON, and no exercise `id` — the recipient
// always gets a fresh id (SharedWorkoutPage generates one per exercise,
// crypto.randomUUID() for the workout itself), so the shared one is
// never read back. Cuts the encoded link to roughly a third of the
// keyed-object form.
type CompactExercise = [name: string, sets: number, targetReps: string, restSeconds: number];
type CompactPayload = [name: string, exercises: CompactExercise[]];

export function encodeSharedWorkout(workout: Pick<Workout, 'name' | 'exercises'>): string {
  const payload: CompactPayload = [
    workout.name,
    workout.exercises.map((exercise) => [exercise.name, exercise.sets, exercise.targetReps, exercise.restSeconds]),
  ];
  const json = JSON.stringify(payload);
  const base64 = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeSharedWorkout(encoded: string): SharedWorkout | null {
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => '%' + char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    const parsed = JSON.parse(json) as CompactPayload;
    const [name, exercises] = parsed;
    if (typeof name !== 'string' || !Array.isArray(exercises)) return null;
    return {
      name,
      exercises: exercises.map(([exerciseName, sets, targetReps, restSeconds], index) => ({
        id: `shared-${index}`,
        name: exerciseName,
        sets,
        targetReps,
        restSeconds,
      })),
    };
  } catch {
    return null;
  }
}

// Query param at the app root, not a /shared/:encoded path segment — this
// is a static site on GitHub Pages with no server-side routing, so a
// fresh/cold hit to a nested path 404s (nothing exists there but
// index.html at the root). ?shared= always resolves, since the root
// always exists; App.tsx reads it on load and routes to /shared/:encoded
// client-side from there.
export function buildShareUrl(workout: Pick<Workout, 'name' | 'exercises'>): string {
  const encoded = encodeSharedWorkout(workout);
  return `${window.location.origin}${import.meta.env.BASE_URL}?shared=${encoded}`;
}

export async function shareWorkout(workout: Pick<Workout, 'name' | 'exercises'>): Promise<void> {
  const url = buildShareUrl(workout);
  if (navigator.share) {
    try {
      await navigator.share({ title: workout.name, url });
      return;
    } catch {
      // User cancelled the native sheet, or share failed — fall through
      // to clipboard so the action still does something useful.
    }
  }
  await navigator.clipboard.writeText(url);
}
