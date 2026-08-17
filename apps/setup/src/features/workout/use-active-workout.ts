// Owns ActiveWorkout React state + persistence. Domain rules (building,
// advancing) live in active-workout.ts; this hook is just wiring:
// load-or-create on mount, tick the clock, persist every mutation so a
// refresh/reopen/navigation-away always resumes exactly where the user
// left off (spec §11).

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Activity } from '@/domain/activity';
import type { TrainingDay, TrainingPlan } from '@/domain/plan';
import type { ActiveExercise, ActiveWorkout, CompletedSet, WorkoutPhase } from '@/domain/workout';
import { storageRepository } from '@/services/storage';
import { createActiveWorkout, nextPosition, phaseList, previousPosition } from './active-workout';

export function useActiveWorkout(dayId: string) {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [day, setDay] = useState<TrainingDay | null>(null);
  const [workout, setWorkout] = useState<ActiveWorkout | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [ready, setReady] = useState(false);
  const workoutRef = useRef<ActiveWorkout | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      storageRepository.getCurrentPlan(),
      storageRepository.getActiveWorkout(),
      storageRepository.getActivities(),
    ]).then(async ([loadedPlan, existing, loadedActivities]) => {
      if (cancelled) return;
      const foundDay = loadedPlan?.days.find((d) => d.id === dayId) ?? null;
      if (!loadedPlan || !foundDay) {
        navigate('/home', { replace: true });
        return;
      }
      // Resume only an in-progress workout for THIS day OF THIS PLAN; a
      // different day, an absent workout, or — critically — a workout
      // left over from a plan the user has since regenerated (Adjust
      // Plan, re-onboarding) all mean start fresh. Matching on
      // trainingDayId alone was a real bug: every generated plan reuses
      // the same "day-1"/"day-2" ids, so a stale in-progress workout from
      // an OLD plan would silently get resumed under a NEW plan — same
      // day-position label, but wrong exercises/prescriptions underneath
      // (and built before that plan's own curated data, e.g. a
      // startingLoad table populated after the stale workout was created).
      let active = existing && existing.trainingDayId === dayId && existing.planId === loadedPlan.id ? existing : null;
      if (!active) {
        active = createActiveWorkout(loadedPlan.id, foundDay, loadedActivities);
        await storageRepository.saveActiveWorkout(active);
      }
      if (cancelled) return;
      setPlan(loadedPlan);
      setDay(foundDay);
      setActivities(loadedActivities);
      setWorkout(active);
      workoutRef.current = active;
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [dayId, navigate]);

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
    (phase: WorkoutPhase, exerciseIndex: number, setIndex: number, patch: Partial<CompletedSet>) => {
      updateWorkout((current) => {
        const list = phaseList(current, phase).map((exercise, i): ActiveExercise => {
          if (i !== exerciseIndex) return exercise;
          return {
            ...exercise,
            sets: exercise.sets.map((set, j) => (j === setIndex ? ({ ...set, ...patch } as CompletedSet) : set)),
          };
        });
        return { ...current, [phase === 'main' ? 'exercises' : phase]: list };
      });
    },
    [updateWorkout],
  );

  // Advances to the next exercise, or the next phase, or — if this was
  // the workout's last exercise — navigates to Completion.
  const goToNext = useCallback(() => {
    const current = workoutRef.current;
    if (!current) return;
    const next = nextPosition(current);
    if (!next) {
      updateWorkout((w) => (w.pausedAt ? w : { ...w, pausedAt: new Date().toISOString() }));
      navigate(`/workout/${dayId}/complete`);
      return;
    }
    updateWorkout((w) => ({ ...w, phase: next.phase, currentExerciseIndex: next.index }));
  }, [dayId, navigate, updateWorkout]);

  // Steps back to the previous exercise/phase. No-ops on the very first
  // exercise of the whole workout (previousPosition returns null there) —
  // the page swaps Back for Exit in that case instead of calling this,
  // this null-guard is just belt-and-braces.
  const goToPrevious = useCallback(() => {
    const current = workoutRef.current;
    if (!current) return;
    const prev = previousPosition(current);
    if (!prev) return;
    updateWorkout((w) => ({ ...w, phase: prev.phase, currentExerciseIndex: prev.index }));
  }, [updateWorkout]);

  // Freezes the clock — reusing the pause mechanism, since there's no
  // "resume" affordance once the user reaches Completion — before
  // navigating there, so the duration shown on the Complete screen is
  // exactly the moment Finish was clicked, not still ticking while the
  // user reads that screen (the Complete page mounts its own
  // useActiveWorkout instance, whose ticking effect would otherwise keep
  // incrementing elapsedSeconds).
  const finishWorkout = useCallback(() => {
    updateWorkout((current) => (current.pausedAt ? current : { ...current, pausedAt: new Date().toISOString() }));
    navigate(`/workout/${dayId}/complete`);
  }, [dayId, navigate, updateWorkout]);

  const saveActivity = useCallback(async () => {
    const current = workoutRef.current;
    if (!current) return;
    const activity: Activity = {
      id: crypto.randomUUID(),
      planId: current.planId,
      trainingDayId: current.trainingDayId,
      startedAt: current.startedAt,
      completedAt: new Date().toISOString(),
      durationSeconds: current.elapsedSeconds,
      warmup: current.warmup,
      exercises: current.exercises,
      cooldown: current.cooldown,
    };
    await storageRepository.saveActivity(activity);
    await storageRepository.clearActiveWorkout();
    navigate('/home', { replace: true });
  }, [navigate]);

  // Also doubles as "Exit" on the very first exercise of the whole
  // workout (WorkoutActivePage — Back has nowhere to go there): exiting
  // without finishing abandons the in-progress attempt entirely rather
  // than leaving it resumable, so the next time this day is started it's
  // a fresh 0:00, not wherever the user walked away from.
  const discardActivity = useCallback(async () => {
    await storageRepository.clearActiveWorkout();
    navigate('/home', { replace: true });
  }, [navigate]);

  return {
    ready,
    plan,
    day,
    workout,
    activities,
    updateSet,
    togglePause,
    goToNext,
    goToPrevious,
    finishWorkout,
    saveActivity,
    discardActivity,
  };
}
