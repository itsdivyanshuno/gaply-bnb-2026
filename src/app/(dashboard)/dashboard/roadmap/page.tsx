'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function RoadmapPage() {
  const [roadmapData, setRoadmapData] = useState<any>({
    totalEstimatedHours: 0,
    weeklySchedule: [],
  });

  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdjustments, setShowAdjustments] = useState(false);

  useEffect(() => {
    const loadRoadmap = async () => {
      const storedUser = localStorage.getItem('gaply_user');

      if (!storedUser) {
        window.location.href = '/signin';
        return;
      }

      try {
        const userData = JSON.parse(storedUser);

        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/roadmap?studentId=${encodeURIComponent(userData.id)}`
        );

        if (!response.ok) {
          throw new Error('Failed to load roadmap');
        }

        const data = await response.json();

        setGapAnalysis(data.analysis);
        setRoadmapData(data.roadmap);
      } catch (err) {
        console.error('Failed to load roadmap:', err);
        setError('Failed to load your personalized roadmap.');
      } finally {
        setLoading(false);
      }
    };

    loadRoadmap();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
          <p className="mt-4 text-sm text-slate-500">
            Building your roadmap...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          !
        </div>

        <h2 className="mt-4 text-lg font-semibold text-red-900">
          Roadmap unavailable
        </h2>

        <p className="mt-1 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  const weeks = roadmapData.weeklySchedule || [];
  const totalHours = roadmapData.totalEstimatedHours || 0;
  const duration = Math.ceil(totalHours / 10);
  const readiness = gapAnalysis?.overallReadiness || 0;

  return (
    <div className="space-y-6">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl md:p-9">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg">
            ↗
          </div>

          <p className="text-sm font-medium text-indigo-300">
            Personalized roadmap
          </p>

          <h2 className="mt-1 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
            Your path to becoming a{' '}
            <span className="text-indigo-300">
              {gapAnalysis?.targetRole || 'professional'}
            </span>
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
            A week-by-week learning plan built around your current skills,
            career goal and identified gaps.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Estimated duration
              </p>
              <p className="mt-1 text-lg font-bold">
                ~{duration} weeks
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Total learning
              </p>
              <p className="mt-1 text-lg font-bold">
                {totalHours} hrs
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Current readiness
              </p>
              <p className="mt-1 text-lg font-bold">
                {readiness}%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard
          label="Weekly commitment"
          value="10 hrs"
          detail="Based on your profile"
          icon="◷"
        />

        <InfoCard
          label="Current readiness"
          value={`${readiness}%`}
          detail="Your starting point"
          icon="◆"
        />

        <InfoCard
          label="Target readiness"
          value="100%"
          detail="Goal for your target role"
          icon="✓"
        />
      </section>

      {/* Timeline */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              Learning journey
            </p>

            <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Your weekly roadmap
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Follow each stage and build momentum week by week.
            </p>
          </div>

          <button
            onClick={() => setShowAdjustments(!showAdjustments)}
            className="self-start rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 sm:self-auto"
          >
            {showAdjustments
              ? 'Hide suggestions'
              : 'View adjustments'}
          </button>
        </div>

        <div className="relative">
          <div className="absolute bottom-5 left-[19px] top-5 w-px bg-slate-200 md:left-[23px]" />

          <div className="space-y-6">
            {weeks.map((week: any, index: number) => (
              <div key={index} className="relative flex gap-4 md:gap-6">

                {/* Timeline marker */}
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white bg-indigo-600 text-xs font-bold text-white shadow-sm md:h-12 md:w-12">
                  {week.week}
                </div>

                {/* Week card */}
                <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-slate-50/70 p-5 transition hover:border-indigo-100 hover:bg-white hover:shadow-md md:p-6">

                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
                        Week {week.week}
                      </p>

                      <h4 className="mt-1 text-lg font-bold text-slate-950">
                        {getWeekTitle(week.week)}
                      </h4>
                    </div>

                    <span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                      {week.hours} hrs
                    </span>
                  </div>

                  <div className="mt-5 space-y-2.5">
                    {week.activities?.map(
                      (activity: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 rounded-xl bg-white p-3"
                        >
                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">
                            ✓
                          </div>

                          <span className="text-sm leading-6 text-slate-600">
                            {activity}
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-200/70 pt-4">
                    <span className="text-xs text-slate-400">
                      {week.activities?.length || 0} activities
                    </span>

                    <span className="text-xs font-medium text-indigo-600">
                      {week.hours}h focus
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {weeks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <p className="font-medium text-slate-700">
              No roadmap has been generated yet.
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Complete your profile and career goal to create one.
            </p>
          </div>
        )}
      </section>

      {/* Adjustment suggestions */}
      {showAdjustments && (
        <section className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 md:p-8">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              Optimization suggestions
            </p>

            <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Fine-tune your learning plan
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              These areas can help you make better use of your learning time.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SuggestionCard
              title="Increase technical depth"
              items={[
                'Advanced Node.js concepts',
                'Database optimization and indexing',
                'System design patterns',
                'Testing strategies and frameworks',
              ]}
            />

            <SuggestionCard
              title="Strengthen practical experience"
              items={[
                'React advanced topics',
                'Full-stack integration projects',
                'Deployment fundamentals',
                'DevOps fundamentals',
              ]}
            />
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-7 md:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              Keep improving
            </p>

            <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Your roadmap adapts as you grow.
            </h3>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Keep your profile and skills updated so your learning plan stays
              aligned with your career goals.
            </p>
          </div>

          <Link
            href="/dashboard/profile"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Update profile
            <span className="ml-2">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
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

function SuggestionCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-white p-5">
      <h4 className="font-semibold text-slate-950">{title}</h4>

      <div className="mt-4 space-y-2.5">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">
              +
            </span>

            <span className="text-sm text-slate-600">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getWeekTitle(week: number) {
  const titles = [
    'Build the foundation',
    'Strengthen core skills',
    'Deepen technical knowledge',
    'Apply what you learned',
    'Build practical experience',
    'Level up your projects',
    'Prepare for real-world work',
    'Final preparation',
  ];

  return titles[(week - 1) % titles.length];
}
