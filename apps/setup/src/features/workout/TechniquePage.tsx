import { useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';

import { IconButton } from '@/components/ui/icon-button';
import { exerciseLibrary } from '@/training/exercises/exercise-library';
import { YouTubeEmbed } from './YouTubeEmbed';

// Paper's "How to do it" section shows a single paragraph, but the domain
// model (domain/exercise.ts) keeps setup/execution as separate step
// arrays — deliberately, so Workout Mode's other consumers can render
// them as discrete steps. Rather than force them into one invented
// sentence, this renders them as a single ordered list (setup steps then
// execution steps): real library content only, no invented prose, closest
// structural match to Paper's "How to do it" intent.
export function TechniquePage() {
  const { exerciseId = '' } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const exercise = exerciseLibrary.find((e) => e.id === exerciseId);

  if (!exercise) return null;
  const { technique } = exercise;
  const howToSteps = [...technique.setup, ...technique.execution];

  return (
    <div className="bg-background flex min-h-svh flex-col items-center">
      <div className="mx-auto flex w-full max-w-[440px] items-center justify-between px-space-7 py-space-7">
        <span className="text-body leading-body text-foreground">{exercise.name}</span>
        <IconButton aria-label="Close" onClick={() => navigate(-1)}>
          <X />
        </IconButton>
      </div>

      <div className="mx-auto w-full max-w-[440px] px-space-7">
        {exercise.videoId ? (
          <YouTubeEmbed videoId={exercise.videoId} title={exercise.name} />
        ) : (
          <div className="bg-interactive-subtle aspect-video w-full rounded-lg" />
        )}
      </div>

      <div className="mx-auto flex w-full max-w-[440px] flex-col px-space-7 py-space-7">
        <div className="flex flex-col gap-space-5">
          <span className="text-heading leading-heading text-foreground">How to do it</span>
          <p className="text-body leading-body text-foreground-secondary">{technique.description}</p>
          <ol className="flex flex-col gap-space-3">
            {howToSteps.map((step, i) => (
              <li key={i} className="text-body leading-body text-foreground flex gap-space-2">
                <span className="text-foreground-secondary">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {technique.cues.length > 0 && (
        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-space-5 px-space-7 py-space-7">
          <span className="text-heading leading-heading text-foreground">Keep in mind</span>
          <ul className="flex flex-col gap-space-3">
            {technique.cues.map((cue, i) => (
              <li key={i} className="text-body leading-body text-foreground">
                {cue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {technique.commonMistakes.length > 0 && (
        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-space-5 px-space-7 py-space-7">
          <span className="text-heading leading-heading text-foreground">Common mistakes</span>
          <ul className="flex flex-col gap-space-3">
            {technique.commonMistakes.map((mistake, i) => (
              <li key={i} className="text-body leading-body text-foreground">
                {mistake}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
