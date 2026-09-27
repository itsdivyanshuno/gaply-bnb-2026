import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:block w-64 border-r border-gray-200">
        <div className="flex h-16 items-center px-4 border-b border-gray-200">
          <span className="text-xl font-semibold text-indigo-600">GAPLY</span>
        </div>
        <nav className="mt-6 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/profile"
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
          >
            Profile
          </Link>
          <Link
            href="/dashboard/skills"
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
          >
            Skills
          </Link>
          <Link
            href="/dashboard/projects"
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
          >
            Projects
          </Link>
          <Link
            href="/dashboard/career-goal"
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
          >
            Career Goal
          </Link>
          <Link
            href="/dashboard/roadmap"
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
          >
            Roadmap
          </Link>
        </nav>
      </aside>
      <div className="flex-1 p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-500">
            Welcome back to your personalized learning journey
          </p>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}