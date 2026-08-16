import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Pause, Play, SkipForward, Square } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { CompletedSet, WorkoutPhase } from '@/domain/workout';
import { exerciseLibrary } from '@/training/exercises/exercise-library';
import { entryAt, exerciseLookup, formatElapsed, nextPosition, phaseList, resolveInitialWeight } from './active-workout';
import { useActiveWorkout } from './use-active-workout';

const PHASE_LABEL: Record<WorkoutPhase, string> = { warmup: 'Warm-up', main: '', cooldown: 'Cool-down' };

function hasWeightField(mode: CompletedSet['mode']): boolean {
  return mode === 'reps-weight' || mode === 'reps-weight-side' || mode === 'duration-weight';
}

// Stat chip shared by the 2x2 grid (Sets x reps / Initial weight / Rest /
// RIR) — matches Paper's exercise-stats block exactly (bg-interactive-
// subtle, rounded-lg, py-space-4/px-space-5).
function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-interactive-subtle flex flex-col gap-space-1 rounded-lg px-space-5 py-space-4">
      <span className="text-label leading-label text-foreground-secondary">{label}</span>
      <span className="text-action leading-action text-foreground">{value}</span>
    </div>
  );
}

export function WorkoutActivePage() {
  const { dayId = '' } = useParams<{ dayId: string }>();
  const { ready, plan, day, workout, activities, updateSet, togglePause, goToNext, finishWorkout } =
    useActiveWorkout(dayId);
  const byId = exerciseLookup(exerciseLibrary);

  // Bottom action bar only casts its "content still hidden below" shadow
  // when there actually is content the fixed bar is covering — not
  // unconditionally. A sentinel right after the last real content: while
  // it's on-screen (nothing left to reveal below the bar) there's no
  // shadow; once it scrolls out of view under the bar, the shadow shows.
  const [showActionsShadow, setShowActionsShadow] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setShowActionsShadow(!entry.isIntersecting), {
      threshold: 1,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ready]);

  if (!ready || !plan || !day || !workout) return null;

  const activeList = phaseList(workout, workout.phase);
  const activeExercise = activeList[workout.currentExerciseIndex];
  const entry = activeExercise ? entryAt(day, workout.phase, activeExercise.exerciseId) : undefined;
  const exercise = entry ? byId.get(entry.exerciseId) : undefined;
  if (!entry || !exercise || !activeExercise) return null;

  const prescription = entry.prescription;
  const sideSuffix = activeExercise.side ? ` (${activeExercise.side === 'left' ? 'Left' : 'Right'})` : '';
  const exerciseLabel =
    workout.phase === 'main' ? `Exercise ${workout.currentExerciseIndex + 1}` : PHASE_LABEL[workout.phase];

  const isLast = nextPosition(workout) === null;
  const paused = Boolean(workout.pausedAt);
  // "Finish" (variant secondary, Square icon) replaces "Next" (variant
  // primary, SkipForward icon) whenever there's nowhere further forward
  // to go automatically — paused (can't advance while stopped) or the
  // workout's last exercise. Same target either way: Completion.
  const showFinish = paused || isLast;

  const setsStatLabel = prescription.mode.startsWith('duration') ? 'Sets x duration' : 'Sets x reps';
  const setsStatValue = prescription.mode.startsWith('duration')
    ? `${prescription.sets} x ${'durationSeconds' in prescription ? prescription.durationSeconds : 0}s`
    : `${prescription.sets} x ${'repRange' in prescription ? `${prescription.repRange[0]}-${prescription.repRange[1]}` : ''}`;
  // History-first (what the user actually lifted last time for this exact
  // set), falling back to the plan's curated suggestedLoad — same
  // resolution active-workout.ts already uses to prefill the set inputs,
  // reused here for the "Initial weight" stat chip. Set 1 specifically:
  // this chip is a single exercise-level "starting point" figure, not a
  // per-set one.
  const initialWeight =
    prescription.mode === 'reps-weight' ||
    prescription.mode === 'reps-weight-side' ||
    prescription.mode === 'duration-weight'
      ? resolveInitialWeight(exercise.id, 1, activeExercise.side, prescription, activities)
      : undefined;
  const initialWeightText = initialWeight !== undefined ? `${initialWeight} kg` : null;
  const rirText =
    'targetRir' in prescription && prescription.targetRir
      ? `${prescription.targetRir[0]}-${prescription.targetRir[1]}`
      : null;
  // Skips the warm-up/cool-down case (restSeconds: 0 there — rules/
  // warmup-cooldown.ts) same as the existing rest-divider-between-sets
  // check below; a "Rest · 0s" chip isn't meaningful.
  const restText =
    'restSeconds' in prescription && prescription.restSeconds ? `${prescription.restSeconds}s` : null;

  // Segment order matches Paper's step-bar: one segment for warm-up, one
  // per main step, one for cool-down. Counts come from the ActiveWorkout's
  // own (expanded) arrays, not day.* — a *-side exercise is two steps, so
  // it gets two segments.
  const segments: { phase: WorkoutPhase; index: number }[] = [
    ...workout.warmup.map((_, i) => ({ phase: 'warmup' as const, index: i })),
    ...workout.exercises.map((_, i) => ({ phase: 'main' as const, index: i })),
    ...workout.cooldown.map((_, i) => ({ phase: 'cooldown' as const, index: i })),
  ];
  const phaseOrder: WorkoutPhase[] = ['warmup', 'main', 'cooldown'];
  const currentPhaseOrder = phaseOrder.indexOf(workout.phase);

  return (
    <div className="bg-background flex min-h-svh flex-col items-center">
      <div className="w-full px-space-7 pb-space-7">
        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-space-6">
          <div className="flex items-baseline gap-space-3 pt-space-7">
            <span className="text-heading leading-heading text-foreground">{formatElapsed(workout.elapsedSeconds)}</span>
            <span className="text-label leading-label text-foreground-secondary">{paused ? 'Time · Stopped' : 'Time'}</span>
          </div>
          <div className="flex items-center gap-space-1">
            {segments.map((segment, i) => {
              const segmentOrder = phaseOrder.indexOf(segment.phase);
              const filled =
                segmentOrder < currentPhaseOrder ||
                (segmentOrder === currentPhaseOrder && segment.index <= workout.currentExerciseIndex);
              return (
                <div
                  key={`${segment.phase}-${segment.index}`}
                  className={`h-1 flex-1 rounded-full ${filled ? 'bg-state-active' : 'bg-state-inactive'} ${i > 0 && segments[i - 1].phase !== segment.phase ? 'ml-space-2' : ''}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Paper's "exercise-details" is ONE frame wrapping title, stats,
          illustration, and the sets list as direct siblings, all sharing
          a single 24px (space-8) gap and one 20px (space-7) padding — not
          three independently-padded sections. Matching that here is what
          gives "Exercise 1" its proper margin from the step-bar above
          (this block's own top padding) and keeps the gaps between title
          → stats → illustration → sets consistent. */}
      <div className="w-full flex-1 p-space-7">
        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-space-8">
          <div className="flex flex-col gap-space-3">
            <span className="text-body leading-body text-foreground-secondary">{exerciseLabel}</span>
            <span className="text-display-md leading-display-md font-light text-foreground">
              {exercise.name}
              {sideSuffix}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-space-5">
            <StatChip label={setsStatLabel} value={setsStatValue} />
            {initialWeightText && <StatChip label="Initial weight" value={initialWeightText} />}
            {restText && <StatChip label="Rest" value={restText} />}
            {rirText && <StatChip label="RIR" value={rirText} />}
          </div>

          {/* No exercise illustration assets exist yet (same gap as
              Technique's video placeholder) — a neutral placeholder keeps
              the layout structured for when real artwork lands, without
              implying content that isn't there. */}
          <div className="bg-interactive-subtle aspect-[350/200] w-full rounded-lg" />

          <div className="flex flex-col gap-space-5">
            {activeExercise.sets.map((set, setIndex) => {
              const showsWeight = hasWeightField(set.mode);
              const isDuration = set.mode.startsWith('duration');
              const isLastSetOfExercise = setIndex === activeExercise.sets.length - 1;
              const restSeconds = 'restSeconds' in prescription ? prescription.restSeconds : undefined;

              return (
                <div key={setIndex}>
                  <div className="flex items-start justify-center gap-space-5">
                    <div className="bg-interactive-subtle flex w-12 shrink-0 items-center justify-center rounded-lg p-space-2">
                      <span className="text-label leading-label text-foreground-secondary text-center">Set {set.setNumber}</span>
                    </div>
                    <div className="border-border-subtle flex flex-1 items-center gap-space-5 rounded-lg border p-space-5">
                      {!isDuration && (
                        <div className="flex flex-1 flex-col items-start gap-space-1">
                          <span className="text-label leading-label text-foreground-secondary">Reps</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            value={'reps' in set ? (set.reps ?? '') : ''}
                            onChange={(event) => {
                              const reps = event.target.value === '' ? undefined : Number(event.target.value);
                              updateSet(workout.phase, workout.currentExerciseIndex, setIndex, {
                                reps,
                                completed: reps !== undefined,
                              } as Partial<CompletedSet>);
                            }}
                            placeholder="0"
                            className="text-display-md leading-display-md text-foreground placeholder:text-foreground/40 w-full border-none bg-transparent outline-none"
                          />
                        </div>
                      )}
                      {isDuration && (
                        <div className="flex flex-1 flex-col items-start gap-space-1">
                          <span className="text-label leading-label text-foreground-secondary">Duration (s)</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            value={'durationSeconds' in set ? (set.durationSeconds ?? '') : ''}
                            onChange={(event) => {
                              const durationSeconds = event.target.value === '' ? undefined : Number(event.target.value);
                              updateSet(workout.phase, workout.currentExerciseIndex, setIndex, {
                                durationSeconds,
                                completed: durationSeconds !== undefined,
                              } as Partial<CompletedSet>);
                            }}
                            placeholder="0"
                            className="text-display-md leading-display-md text-foreground placeholder:text-foreground/40 w-full border-none bg-transparent outline-none"
                          />
                        </div>
                      )}
                      {showsWeight && (
                        <>
                          <div className="bg-border-subtle w-px self-stretch" />
                          <div className="flex flex-1 flex-col items-start gap-space-1">
                            <span className="text-label leading-label text-foreground-secondary">Weight (kg)</span>
                            <input
                              type="number"
                              inputMode="decimal"
                              value={'weight' in set ? (set.weight ?? '') : ''}
                              onChange={(event) => {
                                const weight = event.target.value === '' ? undefined : Number(event.target.value);
                                updateSet(workout.phase, workout.currentExerciseIndex, setIndex, {
                                  weight,
                                } as Partial<CompletedSet>);
                              }}
                              placeholder="0"
                              className="text-display-md leading-display-md text-foreground placeholder:text-foreground/40 w-full border-none bg-transparent outline-none"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {!isLastSetOfExercise && Boolean(restSeconds) && (
                    <div className="flex items-center justify-center gap-space-5 py-space-2">
                      <div className="w-12 shrink-0" />
                      <span className="text-label leading-label text-foreground-secondary">Rest · {restSeconds}s</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div ref={sentinelRef} className="h-px w-full" />
        </div>
      </div>

      <div
        className={`bg-background sticky bottom-0 w-full px-space-7 pt-space-7 pb-8 ${showActionsShadow ? 'shadow-[0_-2px_35px_rgba(41,64,0,0.1)]' : ''}`}
      >
        <div className="mx-auto flex w-full max-w-[440px] items-center gap-space-6">
          <Button variant={paused ? 'primary' : 'ghost'} className="flex-1" onClick={togglePause}>
            {paused ? (
              <Play data-icon="inline-start" fill="currentColor" stroke="none" />
            ) : (
              <Pause data-icon="inline-start" fill="currentColor" stroke="none" />
            )}
            {paused ? 'Resume' : 'Pause'}
          </Button>
          <Button
            variant={showFinish ? 'secondary' : 'primary'}
            className="flex-1"
            onClick={() => {
              if (showFinish) {
                finishWorkout();
              } else {
                goToNext();
              }
            }}
          >
            {showFinish && <Square data-icon="inline-start" fill="currentColor" stroke="none" />}
            {showFinish ? 'Finish' : 'Next'}
            {/* Unlike Play/Pause/Square, SkipForward's leading bar is a
                stroked line, not a filled shape — stroke="none" wiped it
                out entirely, leaving what looked like a plain Play
                triangle. Keep the stroke so the bar renders. */}
            {!showFinish && <SkipForward data-icon="inline-end" fill="currentColor" stroke="currentColor" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
