import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { HomePage } from '@/features/home/HomePage'
import { CreateWorkoutPage } from '@/features/create-workout/CreateWorkoutPage'
import { WorkoutPreviewPage } from '@/features/workout/WorkoutPreviewPage'
import { WorkoutActivePage } from '@/features/workout/WorkoutActivePage'
import { WorkoutCompletePage } from '@/features/workout/WorkoutCompletePage'
import { HistoryPage } from '@/features/history/HistoryPage'
import { ActivityDetailPage } from '@/features/history/ActivityDetailPage'

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
    // useTransitions={false}: by default BrowserRouter wraps every
    // navigation's location update in React.startTransition, which defers
    // the new page's render/commit out of the click handler's synchronous
    // call stack. That's exactly the gap mobile browsers (iOS Safari in
    // particular) use to decide a .focus() call is no longer part of the
    // original tap — breaking the workout-name-input autofocus on
    // /workouts/new. Forcing synchronous navigation keeps the whole click
    // -> route change -> autofocus chain in one gesture.
    <BrowserRouter basename={import.meta.env.BASE_URL} useTransitions={false}>
      {/* No installed-app-specific frame here on purpose: the installed
          PWA must render identically to the mobile browser tab (same
          layout, spacing, sticky behavior, scrolling). An earlier
          position: fixed "app frame" wrapper (pinning a canvas to the
          viewport, a moss status-bar backdrop, safe-area padding on
          sticky bars) diverged the two enough to cause real regressions
          — clipped sticky action bars, pages that stopped scrolling —
          and was reverted. Just the routes, same as any other page. */}
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/workouts/new" element={<CreateWorkoutPage />} />
        <Route path="/workouts/:workoutId/edit" element={<CreateWorkoutPage />} />
        <Route path="/workouts/:workoutId/preview" element={<WorkoutPreviewPage />} />
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
