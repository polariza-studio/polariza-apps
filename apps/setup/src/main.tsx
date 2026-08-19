import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// Reopening the installed PWA from the home screen doesn't reliably
// trigger a fresh service-worker update check on its own (iOS especially
// — the shell can stay pinned to whatever version it last cached).
// Explicitly re-checking on an interval and whenever the app regains
// focus means a new deploy actually reaches an already-installed PWA.
// registerType: 'autoUpdate' (vite.config.ts) then activates + reloads
// automatically the moment an update is found — no user-facing prompt.
registerSW({
  onRegisteredSW(_url, registration) {
    if (!registration) return
    const checkForUpdate = () => void registration.update()
    setInterval(checkForUpdate, 60 * 60 * 1000)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkForUpdate()
    })
  },
})

// CSS 100dvh is unreliable for sizing the app frame in the installed
// (standalone) PWA: on-device measurement showed window.innerHeight
// itself reading two different values (793, then 852 — the true screen
// height) across separate launches of the same app on the same device,
// while CSS dvh-based layout doesn't necessarily re-resolve once it's
// settled on a value at initial paint. window.innerHeight, re-queried
// live and kept in sync via resize, is the one thing that's actually
// been confirmed correct (852, matching the true screen) once settled —
// so it drives --app-frame-height directly instead of leaving sizing to
// dvh's own resolution. index.css's .app-frame-canvas/.app-frame-content
// fall back to 100dvh only for the instant before this runs.
if (window.matchMedia('(display-mode: standalone)').matches) {
  const setAppFrameHeight = () => {
    document.documentElement.style.setProperty('--app-frame-height', `${window.innerHeight}px`)
  }
  setAppFrameHeight()
  window.addEventListener('resize', setAppFrameHeight)
  window.addEventListener('orientationchange', setAppFrameHeight)
  // iOS has been observed settling to its true viewport height a moment
  // after first paint rather than always reporting it immediately —
  // catch that correction even if it doesn't fire a resize event.
  setTimeout(setAppFrameHeight, 300)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
