export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold">Spoonity Meeting Planner</h1>
        <p className="opacity-70">Timezone-Aware Meeting Planner</p>
        <div className="mt-6">
          <a
            href="/plan"
            className="inline-flex items-center rounded-md bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-medium"
          >
            Plan a meeting
          </a>
        </div>
      </div>
    </main>
  );
}

