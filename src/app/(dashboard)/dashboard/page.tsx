'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  const [stats, setStats] = useState({
    skillsAssessed: 0,
    skillsWithDeficit: 0,
    overallReadiness: 0,
    projectsCompleted: 0,
  });

  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('gaply_user');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }

    setAuthLoading(false);

    setStats({
      skillsAssessed: 8,
      skillsWithDeficit: 5,
      overallReadiness: 62,
      projectsCompleted: 3,
    });
  }, []);

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
          <p className="mt-4 text-sm text-slate-500">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/signin';
    return null;
  }

  const firstName =
    user?.name?.split(' ')[0] ||
    user?.firstName ||
    'there';

  return (
    <div className="space-y-6">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl md:p-9">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-24 right-20 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg backdrop-blur">
            ✦
          </div>

          <p className="text-sm font-medium text-indigo-300">
            Welcome back
          </p>

          <h2 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
            Hey {firstName}, let&apos;s close the gap.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
            Track your skills, projects and learning progress in one place.
            Small progress today compounds into bigger opportunities.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/roadmap"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              View roadmap →
            </Link>

            <Link
              href="/dashboard/skills"
              className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Analyze skills
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Skills assessed"
          value={stats.skillsAssessed}
          detail="out of 12 core skills"
          icon="◆"
        />

        <StatCard
          label="Skills to improve"
          value={stats.skillsWithDeficit}
          detail="need attention"
          icon="↗"
        />

        <StatCard
          label="Projects completed"
          value={stats.projectsCompleted}
          detail="hands-on experience"
          icon="▣"
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Overall readiness
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {stats.overallReadiness}%
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-sm text-emerald-600">
              ↗
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all"
              style={{ width: `${stats.overallReadiness}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-slate-400">
            towards your career goal
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">

        {/* Quick actions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              Next steps
            </p>

            <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
              Keep your momentum going
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Pick up where you left off.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ActionCard
              href="/dashboard/profile"
              icon="◉"
              title="Update profile"
              description="Keep your career information current."
            />

            <ActionCard
              href="/dashboard/skills"
              icon="◆"
              title="Analyze skill gaps"
              description="See which skills need more attention."
            />

            <ActionCard
              href="/dashboard/projects"
              icon="▣"
              title="Explore projects"
              description="Find projects that build real experience."
            />

            <ActionCard
              href="/dashboard/roadmap"
              icon="↗"
              title="View roadmap"
              description="Follow your personalized learning path."
            />
          </div>
        </div>

        {/* Activity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              Activity
            </p>

            <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
              Recent progress
            </h3>
          </div>

          <div className="space-y-5">
            <Activity
              icon="✓"
              title="Completed JavaScript Basics"
              detail="2 hours ago · +5 pts to JavaScript"
            />

            <Activity
              icon="→"
              title="Started Node.js Module"
              detail="Yesterday · Enrolled in course"
            />

            <Activity
              icon="◉"
              title="Updated Profile"
              detail="Today · Added education details"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: number;
  detail: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-sm text-indigo-600">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">{detail}</p>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-indigo-100 hover:bg-indigo-50/50"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm text-indigo-600 shadow-sm transition group-hover:bg-indigo-600 group-hover:text-white">
          {icon}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900">
            {title}
          </h4>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}

function Activity({
  icon,
  title,
  detail,
}: {
  icon: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-semibold text-indigo-600">
        {icon}
      </div>

      <div className="min-w-0">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        <p className="mt-1 text-xs text-slate-400">{detail}</p>
      </div>
    </div>
  );
}
