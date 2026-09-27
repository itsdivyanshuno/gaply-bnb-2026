'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '⌂' },
  { href: '/dashboard/profile', label: 'Profile', icon: '◉' },
  { href: '/dashboard/skills', label: 'Skills', icon: '◆' },
  { href: '/dashboard/agent', label: 'AI Career Agent', icon: '✦' },
  { href: '/dashboard/projects', label: 'Projects', icon: '▣' },
  { href: '/dashboard/career-goal', label: 'Career Goal', icon: '◎' },
  { href: '/dashboard/roadmap', label: 'Roadmap', icon: '↗' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white md:flex md:flex-col">
        <div className="flex h-20 items-center border-b border-slate-100 px-6">
          <Link href="/dashboard" className="group">
            <div className="text-2xl font-black tracking-tight text-slate-950">
              GAP<span className="text-indigo-600">LY</span>
            </div>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
              Career intelligence
            </p>
          </Link>
        </div>

        <div className="px-4 pt-8">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                    active
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition ${
                      active
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span>{item.label}</span>

                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm text-white">
              ✦
            </div>
            <p className="text-sm font-semibold text-slate-900">
              Keep building.
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Your next opportunity is closer than you think.
            </p>
          </div>
        </div>
      </aside>

      <div className="min-h-screen md:ml-64">
        <header className="border-b border-slate-200 bg-white/80 px-6 py-5 backdrop-blur-xl md:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
              Your workspace
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              {pathname === '/dashboard'
                ? 'Dashboard'
                : navItems.find((item) => pathname.startsWith(item.href))
                    ?.label || 'Dashboard'}
            </h1>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
