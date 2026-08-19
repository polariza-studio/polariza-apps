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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
