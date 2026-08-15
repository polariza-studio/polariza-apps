// UI-presentation aggregation over saved activity (spec §6.1), not
// training-domain logic — kept local to the Home feature rather than
// under src/training/.

import type { Activity } from '@/domain/activity';

// Tone is purely temporal, not weekend-vs-weekday (that was StartScreen's
// static illustrative graph, not this real one): a day with saved
// activity is always "active" regardless of when it falls; a day without
// activity reads as "past" (today included) or "future" depending on
// where it sits relative to today.
export type WeekTone = 'active' | 'past' | 'future';

export type WeeklyDay = {
  label: string;
  tone: WeekTone;
  /** Bar height in px — fixed scale, see getWeeklyActivitySummary. */
  height: number;
};

export type WeeklyActivitySummary = {
  totalMinutes: number;
  days: WeeklyDay[];
};

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
// Graph height is fixed regardless of data — a day's bar is scaled
// against `referenceMinutes` (the user's own usual session length, the
// most meaningful "typical" available per user) and clamped to this max,
// rather than against the week's own busiest day, so the graph doesn't
// visually resize week to week.
const MAX_BAR_HEIGHT = 67;
const MIN_ACTIVE_HEIGHT = 8;
const NO_ACTIVITY_HEIGHT = 1;
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const daysSinceMonday = (result.getDay() + 6) % 7;
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - daysSinceMonday);
  return result;
}

// Only saved activities reach this — discarded workouts are never
// persisted (spec §6.1: "Discarded workouts must not appear").
export function getWeeklyActivitySummary(
  activities: Activity[],
  referenceMinutes: number,
  now: Date = new Date(),
): WeeklyActivitySummary {
  const start = startOfWeek(now);
  const todayIndex = Math.floor((now.getTime() - start.getTime()) / DAY_MS);
  const minutesByDay = Array<number>(7).fill(0);

  for (const activity of activities) {
    const dayIndex = Math.floor((new Date(activity.completedAt).getTime() - start.getTime()) / DAY_MS);
    if (dayIndex < 0 || dayIndex > 6) continue;
    minutesByDay[dayIndex] += activity.durationSeconds / 60;
  }

  const totalMinutes = Math.round(minutesByDay.reduce((sum, minutes) => sum + minutes, 0));

  const days = DAY_LABELS.map((label, index) => {
    const minutes = minutesByDay[index];
    if (minutes > 0) {
      const height = Math.max(MIN_ACTIVE_HEIGHT, Math.min(MAX_BAR_HEIGHT, Math.round((minutes / referenceMinutes) * MAX_BAR_HEIGHT)));
      return { label, tone: 'active' as const, height };
    }
    const tone: WeekTone = index <= todayIndex ? 'past' : 'future';
    return { label, tone, height: NO_ACTIVITY_HEIGHT };
  });

  return { totalMinutes, days };
}
