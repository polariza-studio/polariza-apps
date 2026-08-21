import type { WeeklyActivitySummary, WeekTone } from './weekly-activity';

// WeeklyActivity v1 — Home's "Esta semana" block: the total-minutes stat
// plus the 7-day bar chart, extracted as one unit because Paper treats
// them as a single frame ("weekly-activity"/"weekly-stats"), not two
// separate pieces. Verified against Paper — matches exactly, no drift to
// correct here (bar width, the 2px gap between bars and labels, and all
// three tone colors, including the 20%-opacity "future" tone that has no
// dedicated semantic token of its own).
const WEEK_TONE_COLOR: Record<WeekTone, string> = {
  active: 'var(--foreground)',
  past: 'var(--foreground-secondary)',
  future: 'color-mix(in srgb, var(--moss) 20%, transparent)',
};

function WeeklyActivity({ weekly }: { weekly: WeeklyActivitySummary }) {
  return (
    <div className="flex flex-col gap-space-7">
      <div className="flex flex-col gap-space-3">
        <span className="text-body leading-body text-foreground-secondary">Esta semana</span>
        <div className="flex items-baseline gap-space-3">
          <span className="text-display-lg leading-display-lg text-foreground">{weekly.totalMinutes}</span>
          <span className="text-body leading-body text-foreground">min</span>
        </div>
      </div>

      <div className="flex flex-col gap-[2px] px-space-1">
        <div className="flex h-[67px] items-end justify-between">
          {weekly.days.map((day, index) => (
            <div key={index} className="w-3" style={{ height: day.height, backgroundColor: WEEK_TONE_COLOR[day.tone] }} />
          ))}
        </div>
        <div className="flex items-start justify-between">
          {weekly.days.map((day, index) => (
            <span
              key={index}
              className="w-3 text-center text-label-emphasis leading-label-emphasis"
              style={{ color: WEEK_TONE_COLOR[day.tone] }}
            >
              {day.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export { WeeklyActivity };
