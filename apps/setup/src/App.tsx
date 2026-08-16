import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { RequireOnboarding } from '@/app/RequireOnboarding'
import { RootRedirect } from '@/app/RootRedirect'
import { AdjustPlanLayout } from '@/features/adjust-plan/AdjustPlanLayout'
import { AdjustPlanPage } from '@/features/adjust-plan/AdjustPlanPage'
import {
  AdjustPlanDaysPage,
  AdjustPlanEnvironmentPage,
  AdjustPlanExperiencePage,
  AdjustPlanGoalPage,
  AdjustPlanTimePage,
} from '@/features/adjust-plan/field-pages'
import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow'
import { HomePage } from '@/features/home/HomePage'
import { PlanLoadingScreen } from '@/features/plan/PlanLoadingScreen'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { TechniquePage } from '@/features/workout/TechniquePage'
import { WorkoutActivePage } from '@/features/workout/WorkoutActivePage'
import { WorkoutCompletePage } from '@/features/workout/WorkoutCompletePage'
import { WorkoutOverviewPage } from '@/features/workout/WorkoutOverviewPage'

// basename matches vite.config.ts's `base` (production: /polariza-apps/setup/,
// dev: /) so deep links resolve correctly under the GitHub Pages subpath.
//
// No app-wide width cap here on purpose: the designs are mobile-only
// (code-first, mobile-first per the functional spec) and need to stay
// readable on desktop browsers, but each screen's *background* should
// still reach full viewport width — only its content should stay
// mobile-width and centered. Capping width at this level would have
// clipped the background too, so each page caps its own content instead
// (e.g. StartScreen.tsx, OnboardingFlow.tsx) via a local
// `mx-auto max-w-[440px]` — a bit roomier than Paper's 390px mobile
// artboard, so larger phones/small tablets don't feel cramped before the
// cap kicks in.
function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/onboarding" element={<OnboardingFlow />} />
        <Route
          path="/loading"
          element={
            <RequireOnboarding>
              <PlanLoadingScreen />
            </RequireOnboarding>
          }
        />
        <Route
          path="/home"
          element={
            <RequireOnboarding>
              <HomePage />
            </RequireOnboarding>
          }
        />
        <Route
          path="/adjust-plan"
          element={
            <RequireOnboarding>
              <AdjustPlanLayout />
            </RequireOnboarding>
          }
        >
          <Route index element={<AdjustPlanPage />} />
          <Route path="goal" element={<AdjustPlanGoalPage />} />
          <Route path="experience" element={<AdjustPlanExperiencePage />} />
          <Route path="days" element={<AdjustPlanDaysPage />} />
          <Route path="time" element={<AdjustPlanTimePage />} />
          <Route path="environment" element={<AdjustPlanEnvironmentPage />} />
        </Route>
        <Route
          path="/workout/:dayId"
          element={
            <RequireOnboarding>
              <WorkoutOverviewPage />
            </RequireOnboarding>
          }
        />
        <Route
          path="/workout/:dayId/active"
          element={
            <RequireOnboarding>
              <WorkoutActivePage />
            </RequireOnboarding>
          }
        />
        <Route
          path="/workout/:dayId/complete"
          element={
            <RequireOnboarding>
              <WorkoutCompletePage />
            </RequireOnboarding>
          }
        />
        <Route
          path="/workout/:dayId/technique/:exerciseId"
          element={
            <RequireOnboarding>
              <TechniquePage />
            </RequireOnboarding>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireOnboarding>
              <SettingsPage />
            </RequireOnboarding>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
