import { BrowserRouter, Navigate, Route, Routes, useSearchParams } from 'react-router-dom'

import { HomePage } from '@/features/home/HomePage'
import { CreateWorkoutPage } from '@/features/create-workout/CreateWorkoutPage'
import { WorkoutActivePage } from '@/features/workout/WorkoutActivePage'
import { WorkoutCompletePage } from '@/features/workout/WorkoutCompletePage'
import { HistoryPage } from '@/features/history/HistoryPage'
import { ActivityDetailPage } from '@/features/history/ActivityDetailPage'

// GitHub Pages is a static host with no server-side routing — a fresh
// hit to a nested path 404s (nothing exists there but index.html at the
// root). share-link.ts's buildShareUrl points shared links at the root
// with ?shared= instead, which always resolves; this forwards it onto
// /home, where HomePage reads the same param and opens the shared-workout
// modal on top of itself — a shared link is a deep link into a Home
// state, never its own page (see SharedWorkoutModal).
function RootRedirect() {
  const [searchParams] = useSearchParams()
  const shared = searchParams.get('shared')
  return <Navigate to={shared ? `/home?shared=${shared}` : '/home'} replace />
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
      {/* No installed-app-specific frame here on purpose: the installed
          PWA must render identically to the mobile browser tab (same
          layout, spacing, sticky behavior, scrolling). An earlier
          position: fixed "app frame" wrapper (pinning a canvas to the
          viewport, a moss status-bar backdrop, safe-area padding on
          sticky bars) diverged the two enough to cause real regressions
          — clipped sticky action bars, pages that stopped scrolling —
          and was reverted. Just the routes, same as any other page. */}
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/workouts/new" element={<CreateWorkoutPage />} />
        <Route path="/workouts/:workoutId/edit" element={<CreateWorkoutPage />} />
        <Route path="/workouts/:workoutId/active" element={<WorkoutActivePage />} />
        <Route path="/workouts/:workoutId/complete" element={<WorkoutCompletePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/:activityId" element={<ActivityDetailPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
