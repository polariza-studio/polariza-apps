import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { HomePage } from '@/features/home/HomePage'
import { SharedWorkoutPage } from '@/features/home/SharedWorkoutPage'
import { CreateWorkoutPage } from '@/features/create-workout/CreateWorkoutPage'
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
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      {/* Installed-app frame — only takes visual effect in standalone
          display mode (index.css): the status bar there is
          black-translucent (index.html), and its icons are always white,
          so the page needs something dark behind them. The gutter div
          reserves the notch-height gap (revealing the dark canvas
          there); the content div rounds the page's top corners exactly
          where light content starts, via clip-path (not
          overflow-hidden) so it doesn't break the sticky footers some
          pages use (position: sticky needs the real document scroll,
          not a clipped ancestor). In a regular browser tab none of this
          applies — the browser's own chrome already frames the page. */}
      <div className="app-frame-canvas min-h-svh">
        <div className="app-frame-gutter">
          <div className="app-frame-content">
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
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
