// Owns ActiveWorkout React state + persistence. Domain rules (building)
// live in active-workout.ts; this hook is just wiring: load-or-create on
// mount, tick the clock, persist every mutation so a refresh/reopen/
// navigation-away always resumes exactly where the user left off.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Activity, ActivityExercise } from '@/domain/activity';
import type { ActiveSet, ActiveWorkout } from '@/domain/workout';
import { storageRepository } from '@/services/storage';
import { createActiveWorkout } from './active-workout';

export function useActiveWorkout(workoutId: string) {
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<ActiveWorkout | null>(null);
  const [ready, setReady] = useState(false);
  const workoutRef = useRef<ActiveWorkout | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      storageRepository.getWorkout(workoutId),
      storageRepository.getActiveWorkout(),
      storageRepository.getActivities(),
    ]).then(async ([source, existing, activities]) => {
      if (cancelled) return;
      if (!source) {
        navigate('/home', { replace: true });
        return;
      }
      // Resume only an in-progress session for THIS workout — a
      // different workout, or none in progress, both mean start fresh.
      let active = existing && existing.workoutId === workoutId ? existing : null;
      if (!active) {
        active = createActiveWorkout(source, activities);
        await storageRepository.saveActiveWorkout(active);
      }
      if (cancelled) return;
      setWorkout(active);
      workoutRef.current = active;
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [workoutId, navigate]);

  const updateWorkout = useCallback((updater: (current: ActiveWorkout) => ActiveWorkout) => {
    setWorkout((current) => {
      if (!current) return current;
      const next = updater(current);
      workoutRef.current = next;
      void storageRepository.saveActiveWorkout(next);
      return next;
    });
  }, []);

  // Elapsed-time ticking. Depends only on the paused flag (not on
  // `workout` itself), so a tick's own state update doesn't restart the
  // interval every second.
  useEffect(() => {
    if (!ready || workout?.pausedAt) return;
    const interval = setInterval(() => {
      updateWorkout((current) => ({ ...current, elapsedSeconds: current.elapsedSeconds + 1 }));
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, workout?.pausedAt, updateWorkout]);

  const togglePause = useCallback(() => {
    updateWorkout((current) =>
      current.pausedAt ? { ...current, pausedAt: undefined } : { ...current, pausedAt: new Date().toISOString() },
    );
  }, [updateWorkout]);

  const updateSet = useCallback(
    (exerciseIndex: number, setIndex: number, patch: Partial<ActiveSet>) => {
      updateWorkout((current) => ({
        ...current,
        exercises: current.exercises.map((exercise, i) =>
          i !== exerciseIndex
            ? exercise
            : { ...exercise, sets: exercise.sets.map((set, j) => (j === setIndex ? { ...set, ...patch } : set)) },
        ),
      }));
    },
    [updateWorkout],
  );

  const goToNext = useCallback(() => {
    const current = workoutRef.current;
    if (!current) return;
    if (current.currentExerciseIndex + 1 >= current.exercises.length) {
      updateWorkout((w) => (w.pausedAt ? w : { ...w, pausedAt: new Date().toISOString() }));
      navigate(`/workouts/${workoutId}/complete`);
      return;
    }
    updateWorkout((w) => ({ ...w, currentExerciseIndex: w.currentExerciseIndex + 1 }));
  }, [workoutId, navigate, updateWorkout]);

  const goToPrevious = useCallback(() => {
    updateWorkout((current) =>
      current.currentExerciseIndex === 0 ? current : { ...current, currentExerciseIndex: current.currentExerciseIndex - 1 },
    );
  }, [updateWorkout]);

  // Freezes the clock before navigating to Completion, so the duration
  // shown there is exactly the moment Finish was clicked.
  const finishWorkout = useCallback(() => {
    updateWorkout((current) => (current.pausedAt ? current : { ...current, pausedAt: new Date().toISOString() }));
    navigate(`/workouts/${workoutId}/complete`);
  }, [workoutId, navigate, updateWorkout]);

  const saveActivity = useCallback(async () => {
    const current = workoutRef.current;
    if (!current) return;
    const exercises: ActivityExercise[] = current.exercises.map((exercise) => ({
      exerciseName: exercise.name,
      sets: exercise.sets.map((set) => ({ reps: set.reps, weight: set.weight })),
    }));
    const activity: Activity = {
      id: crypto.randomUUID(),
      workoutId: current.workoutId,
      workoutName: current.workoutName,
      date: new Date().toISOString(),
      durationSeconds: current.elapsedSeconds,
      exercises,
    };
    await storageRepository.saveActivity(activity);
    await storageRepository.clearActiveWorkout();
    navigate('/home', { replace: true });
  }, [navigate]);

  // Discards the in-progress attempt rather than leaving it resumable —
  // exiting without finishing means the next time this workout is
  // started it's a fresh 0:00.
  const discardActivity = useCallback(async () => {
    await storageRepository.clearActiveWorkout();
    navigate('/home', { replace: true });
  }, [navigate]);

  return {
    ready,
    workout,
    updateSet,
    togglePause,
    goToNext,
    goToPrevious,
    finishWorkout,
    saveActivity,
    discardActivity,
  };
}
