import { useEffect, useState } from 'react';
import { Share, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';

const DISMISSED_KEY = 'setup:install-banner-dismissed';

// Chrome/Android (and other Chromium browsers) fire this before showing
// their own install UI; capturing it lets us trigger that native prompt
// from our own button instead of waiting for the browser's automatic one
// (which needs repeat-visit "engagement" heuristics that can take a while
// to satisfy, if it fires at all). Not in lib.dom.d.ts yet, hence the
// local type.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari's own (non-standard) flag — matchMedia above doesn't
    // cover it.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

// iOS Safari has no `beforeinstallprompt` — Apple deliberately doesn't
// offer one — so an app-triggered install is impossible there. The best
// available UX is telling the user exactly which manual gesture does it.
export function InstallAppBanner() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === '1');
  const [ios] = useState(isIos);

  useEffect(() => {
    if (isStandalone()) return;
    function handler(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  }

  async function handleInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    setInstallEvent(null);
    dismiss();
  }

  if (dismissed || isStandalone()) return null;
  if (!ios && !installEvent) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-space-7 py-space-5">
      <div className="mx-auto flex w-full max-w-[440px] items-center gap-space-5 rounded-lg bg-background p-space-6 outline outline-1 outline-border-subtle shadow-button">
        <div className="flex flex-1 flex-col gap-space-1">
          <span className="text-body-emphasis leading-body-emphasis text-foreground">Save SetUp to your phone</span>
          {ios ? (
            <span className="flex items-center gap-space-2 text-caption leading-caption text-foreground-secondary">
              Tap <Share className="size-4 shrink-0 [stroke-width:1.5]" /> then "Add to Home Screen"
            </span>
          ) : (
            <span className="text-caption leading-caption text-foreground-secondary">
              Install the app for quick access, even offline.
            </span>
          )}
        </div>
        {!ios && (
          <Button variant="primary" onClick={handleInstall}>
            Install
          </Button>
        )}
        <IconButton aria-label="Dismiss" onClick={dismiss}>
          <X />
        </IconButton>
      </div>
    </div>
  );
}
