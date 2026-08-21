// Owns ActiveWorkout React state + persistence. Domain rules (building)
// live in active-workout.ts; this hook is just wiring: load-or-create on
// mount, tick the clock, persist every mutation so a refresh/reopen/
// navigation-away always resumes exactly where the user left off.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Activity, ActivityExercise } from '@/domain/activity';
import type { ActiveSet, ActiveWorkout } from '@/domain/workout';
import { storageRepository } from '@/services/storage';
import { computeElapsedSeconds, createActiveWorkout } from './active-workout';

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

  // Elapsed time is always recomputed from `startedAt`/`pausedAt`/`pausedMs`
  // (see computeElapsedSeconds) — this tick only forces a re-render so the
  // on-screen counter keeps moving while the tab is active. It never
  // accumulates time itself, so it can't drift or stall when the interval
  // is throttled or paused by a backgrounded/locked device.
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    if (!ready || workout?.pausedAt) return;
    const interval = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [ready, workout?.pausedAt]);

  // The visual tick above can be throttled while backgrounded, so on
  // return-to-foreground force an immediate recompute rather than waiting
  // for the next 1s tick.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') setNowTick(Date.now());
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const elapsedSeconds = workout ? computeElapsedSeconds(workout, nowTick) : 0;

  // Screen Wake Lock: keep the display on while a workout is active. Best
  // effort only — unsupported browsers/devices, or a denied request, must
  // never affect the timer or the rest of the workout flow.
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    let sentinel: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      if (!('wakeLock' in navigator)) return;
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (cancelled) {
          void lock.release();
          return;
        }
        sentinel = lock;
      } catch {
        // Unsupported, denied, or page not visible — fail silently.
      }
    };
    void requestWakeLock();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !sentinel) void requestWakeLock();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      void sentinel?.release();
    };
  }, [ready]);

  const togglePause = useCallback(() => {
    updateWorkout((current) => {
      if (!current.pausedAt) return { ...current, pausedAt: new Date().toISOString() };
      const pausedFor = Date.now() - new Date(current.pausedAt).getTime();
      return { ...current, pausedAt: undefined, pausedMs: (current.pausedMs ?? 0) + pausedFor };
    });
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

  // Freezes the clock and persists it directly — not via updateWorkout's
  // setState-updater side effect — because the caller navigates away
  // (to Completion) in the very same synchronous handler right after
  // this runs. With router navigation now synchronous (App.tsx's
  // useTransitions={false}), that route change and this component's
  // pending state update land in the same React commit, and the
  // component unmounting as part of that commit means React never gets
  // around to invoking the queued updater — so the pausedAt write inside
  // it silently never happened, and the Completion screen's timer kept
  // ticking. Writing straight to storage (and workoutRef/setWorkout)
  // here doesn't depend on this component surviving to its next render.
  const pauseAndPersist = useCallback((current: ActiveWorkout): ActiveWorkout => {
    if (current.pausedAt) return current;
    const paused = { ...current, pausedAt: new Date().toISOString() };
    workoutRef.current = paused;
    void storageRepository.saveActiveWorkout(paused);
    setWorkout(paused);
    return paused;
  }, []);

  const goToNext = useCallback(() => {
    const current = workoutRef.current;
    if (!current) return;
    if (current.currentExerciseIndex + 1 >= current.exercises.length) {
      pauseAndPersist(current);
      navigate(`/workouts/${workoutId}/complete`);
      return;
    }
    updateWorkout((w) => ({ ...w, currentExerciseIndex: w.currentExerciseIndex + 1 }));
  }, [workoutId, navigate, updateWorkout, pauseAndPersist]);

  const goToPrevious = useCallback(() => {
    updateWorkout((current) =>
      current.currentExerciseIndex === 0 ? current : { ...current, currentExerciseIndex: current.currentExerciseIndex - 1 },
    );
  }, [updateWorkout]);

  // Freezes the clock before navigating to Completion, so the duration
  // shown there is exactly the moment Finish was clicked.
  const finishWorkout = useCallback(() => {
    const current = workoutRef.current;
    if (current) pauseAndPersist(current);
    navigate(`/workouts/${workoutId}/complete`);
  }, [workoutId, navigate, pauseAndPersist]);

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
      durationSeconds: computeElapsedSeconds(current),
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
    elapsedSeconds,
    updateSet,
    togglePause,
    goToNext,
    goToPrevious,
    finishWorkout,
    saveActivity,
    discardActivity,
  };
}
