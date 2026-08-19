import { BrowserRouter, Navigate, Route, Routes, useSearchParams } from 'react-router-dom'

import { HomePage } from '@/features/home/HomePage'
import { SharedWorkoutPage } from '@/features/home/SharedWorkoutPage'
import { CreateWorkoutPage } from '@/features/create-workout/CreateWorkoutPage'
import { WorkoutActivePage } from '@/features/workout/WorkoutActivePage'
import { WorkoutCompletePage } from '@/features/workout/WorkoutCompletePage'
import { HistoryPage } from '@/features/history/HistoryPage'
import { ActivityDetailPage } from '@/features/history/ActivityDetailPage'

// GitHub Pages is a static host with no server-side routing — a fresh
// hit to /shared/:encoded 404s (nothing exists there but index.html at
// the root). share-link.ts's buildShareUrl points shared links at the
// root with ?shared= instead, which always resolves; this reads it back
// off and hands off to the real client-side route.
function RootRedirect() {
  const [searchParams] = useSearchParams()
  const shared = searchParams.get('shared')
  return <Navigate to={shared ? `/shared/${shared}` : '/home'} replace />
}

// basename matches vite.config.ts's `base` (production: /polariza-apps/setup/,
// dev: /) so deep links resolve correctly under the GitHub Pages subpath.
//
// No app-wide width cap here on purpose: the designs are mobile-only
// (code-first, mobile-first) and need to stay readable on desktop
// browsers, but each screen's *background* should still reach full
// viewport width — only its content should stay mobile-width and
// centered. Each page caps its own content instead via a local
// `mx-auto max-w-[440px]`.
function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      {/* Installed-app frame — only takes visual effect in standalone
          display mode (index.css): the status bar there is
          black-translucent, so page content shows through it and needs
          something dark behind it. The canvas div is pinned to the real
          viewport via position: fixed + inset (not a measured height —
          dvh/innerHeight both proved unreliable on iOS here) and is the
          scroll container, with a moss backdrop confined to a top strip
          exactly as tall as the status bar (canvas::before) — not a
          blanket background, so it can't leak into the bottom safe area
          or an overscroll reveal. The gutter div reserves the
          notch-height gap on top of that (revealing the moss strip
          there); the content div rounds the page's top corners exactly
          where light content starts, via clip-path (not overflow-hidden)
          so it doesn't break the sticky footers some pages use (position:
          sticky needs a real scrolling ancestor, not a clipped one — the
          canvas div still is one). In a regular browser tab none of this
          applies — the browser's own chrome already frames the page. */}
      <div className="app-frame-canvas">
        <div className="app-frame-gutter">
          <div className="app-frame-content">
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/shared/:encoded" element={<SharedWorkoutPage />} />
              <Route path="/workouts/new" element={<CreateWorkoutPage />} />
              <Route path="/workouts/:workoutId/edit" element={<CreateWorkoutPage />} />
              <Route path="/workouts/:workoutId/active" element={<WorkoutActivePage />} />
              <Route path="/workouts/:workoutId/complete" element={<WorkoutCompletePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/history/:activityId" element={<ActivityDetailPage />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
