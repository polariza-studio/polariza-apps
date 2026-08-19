// Sharing a workout has no backend (see functional spec: "avoid
// unnecessary backend complexity") — the workout's name and exercises are
// encoded directly into the URL. Opening that URL decodes them back out;
// there is nothing to look up, so a malformed/tampered link just fails to
// decode rather than 404ing against a server.
import type { Workout, WorkoutExercise } from '@/domain/workout';

export type SharedWorkout = {
  name: string;
  exercises: WorkoutExercise[];
};

export function encodeSharedWorkout(workout: Pick<Workout, 'name' | 'exercises'>): string {
  const payload: SharedWorkout = { name: workout.name, exercises: workout.exercises };
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
    const parsed = JSON.parse(json) as SharedWorkout;
    if (typeof parsed.name !== 'string' || !Array.isArray(parsed.exercises)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function buildShareUrl(workout: Pick<Workout, 'name' | 'exercises'>): string {
  const encoded = encodeSharedWorkout(workout);
  return `${window.location.origin}${import.meta.env.BASE_URL}shared/${encoded}`;
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
