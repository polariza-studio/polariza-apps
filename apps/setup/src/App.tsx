import { Button } from '@/components/ui/button'

function App() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-semibold">SetUp</h1>
      <p className="text-muted-foreground max-w-sm">
        Plan, organize, and track your workouts.
      </p>
      <Button disabled>Coming soon</Button>
    </main>
  )
}

export default App
