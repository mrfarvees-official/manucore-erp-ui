export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <span className="text-xl font-bold tracking-tight">
            ManuCore
          </span>

          <span className="text-sm text-gray-500">
            Enterprise Platform
          </span>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-600">
          Enterprise Resource Planning
        </p>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Manage your business from one place.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
          A unified platform for inventory, procurement,
          production, and business operations.
        </p>

        <div className="mt-10 flex gap-4">
          <a
            href="/login"
            className="rounded-lg bg-blue-600 px-5 py-3
              text-sm font-semibold text-white
              hover:bg-blue-700"
          >
            Get started
          </a>

          <a
            href="/dashboard"
            className="rounded-lg border border-gray-300
              px-5 py-3 text-sm font-semibold
              hover:bg-gray-50"
          >
            Dashboard
          </a>
        </div>
      </section>
    </main>
  );
}