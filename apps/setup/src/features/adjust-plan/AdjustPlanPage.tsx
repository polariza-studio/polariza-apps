import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { answersEqual } from '@/domain/onboarding';
import { MultiSelectChip } from '@/features/onboarding/MultiSelectChip';
import { EQUIPMENT_OPTIONS, EXPERIENCE_OPTIONS, FOCUS_OPTIONS, GOAL_OPTIONS } from '@/features/onboarding/step-options';
import { storageRepository } from '@/services/storage';

import { useAdjustPlan } from './adjust-plan-context';

const GOAL_LABEL = Object.fromEntries(GOAL_OPTIONS.map((option) => [option.value, option.label]));
const EXPERIENCE_LABEL = Object.fromEntries(EXPERIENCE_OPTIONS.map((option) => [option.value, option.label]));

// A row is either a static fact (Name — read-only, no chevron) or a link
// to one of the field pickers (Goal/Experience/Days/Time/Equipment —
// chevron, tappable). `bare` drops the row's own border/padding, for
// Equipment where it's nested as the header of a larger bordered block
// (the row plus, for 'home', the equipment chip grid below it).
function SettingsRow({
  label,
  value,
  onClick,
  bare = false,
}: {
  label: string;
  value: string;
  onClick?: () => void;
  bare?: boolean;
}) {
  const content = (
    <>
      <span className="flex flex-1 flex-col items-start gap-space-1">
        <span className="text-caption leading-caption text-foreground-secondary">{label}</span>
        <span className="text-heading leading-heading font-light text-foreground">{value}</span>
      </span>
      {onClick && <ChevronRight className="size-5 shrink-0 text-foreground [stroke-width:1.5]" />}
    </>
  );
  const className = bare
    ? 'flex items-center gap-space-5 self-stretch text-left'
    : 'flex items-center gap-space-5 self-stretch border-b border-border-subtle py-space-6 text-left';
  if (!onClick) return <div className={className}>{content}</div>;
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="px-space-7 py-space-7">
      <div className="mx-auto flex w-full max-w-[440px] flex-col items-start">
        <span className="text-heading leading-heading font-light text-foreground-secondary">{title}</span>
        {children}
      </div>
    </div>
  );
}

export function AdjustPlanPage() {
  const navigate = useNavigate();
  const { original, draft, setField } = useAdjustPlan();

  async function handleSave() {
    if (answersEqual(draft, original)) {
      // Nothing actually changed — no reason to touch the current plan
      // or regenerate; historical activity is untouched either way.
      navigate('/home');
      return;
    }
    await storageRepository.savePreferences(draft);
    navigate('/loading');
  }

  const isHome = draft.trainingEnvironment === 'home';

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="flex h-16 shrink-0 items-center justify-between p-space-7">
        <span className="text-body leading-body text-foreground">Adjust plan</span>
        <IconButton aria-label="Close" onClick={() => navigate('/home')}>
          <X />
        </IconButton>
      </div>

      <div className="flex flex-1 flex-col">
        <Section title="About you">
          <div className="flex flex-col items-start gap-space-1 self-stretch border-b border-border-subtle py-space-6">
            <label htmlFor="adjust-plan-name" className="text-caption leading-caption text-foreground-secondary">
              Name
            </label>
            <input
              id="adjust-plan-name"
              type="text"
              value={draft.name}
              onChange={(event) => setField('name', event.target.value)}
              className="w-full bg-transparent text-heading leading-heading font-light text-foreground outline-none"
            />
          </div>
          <SettingsRow
            label="Goal"
            value={GOAL_LABEL[draft.goal]}
            onClick={() => navigate('/adjust-plan/goal')}
          />
          <SettingsRow
            label="Experience"
            value={EXPERIENCE_LABEL[draft.experience]}
            onClick={() => navigate('/adjust-plan/experience')}
          />
        </Section>

        <Section title="About workouts">
          <SettingsRow label="Days" value={String(draft.daysPerWeek)} onClick={() => navigate('/adjust-plan/days')} />
          <SettingsRow
            label="Time"
            value={`${draft.sessionDuration} min`}
            onClick={() => navigate('/adjust-plan/time')}
          />

          {/* Equipment is a picker link in both variants (Where will you
              train? — Gym/Home), same as Days/Time; the chip grid below
              only applies once trainingEnvironment is 'home'. */}
          <div className="flex flex-col items-start gap-space-7 self-stretch border-b border-border-subtle py-space-6">
            <SettingsRow
              label="Equipment"
              value={isHome ? 'Home' : 'Gym'}
              onClick={() => navigate('/adjust-plan/environment')}
              bare
            />
            {isHome && (
              <div className="flex flex-wrap gap-space-6 self-stretch">
                {EQUIPMENT_OPTIONS.map((option) => {
                  const selected = draft.equipment.includes(option.value);
                  return (
                    <MultiSelectChip
                      key={option.value}
                      label={option.label}
                      selected={selected}
                      onToggle={() =>
                        setField(
                          'equipment',
                          selected
                            ? draft.equipment.filter((item) => item !== option.value)
                            : [...draft.equipment, option.value],
                        )
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col items-start gap-space-7 self-stretch py-space-6">
            <span className="text-heading leading-heading font-light text-foreground">Focus</span>
            <div className="flex flex-wrap gap-space-6">
              {FOCUS_OPTIONS.map((option) => {
                const selected = draft.focusAreas.includes(option.value);
                return (
                  <MultiSelectChip
                    key={option.value}
                    label={option.label}
                    selected={selected}
                    onToggle={() =>
                      setField(
                        'focusAreas',
                        selected
                          ? draft.focusAreas.filter((item) => item !== option.value)
                          : [...draft.focusAreas, option.value],
                      )
                    }
                  />
                );
              })}
            </div>
          </div>
        </Section>
      </div>

      <div className="px-space-7 py-[32px]">
        <div className="mx-auto w-full max-w-[440px]">
          <Button variant="primary" className="w-full" onClick={handleSave}>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
