'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type RoadmapAdjustment = {
  type?: string;
  title?: string;
  description?: string;
  rationale?: string;
  confidence?: number;
  suggestedChanges?: Array<{
    type?: string;
    title?: string;
    description?: string;
    estimatedEffort?: number;
    rationale?: string;
  }>;
};

export default function RoadmapPage() {
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const [adjustments, setAdjustments] = useState<RoadmapAdjustment | null>(
    null
  );
  const [careerGoal, setCareerGoal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const [roadmapResponse, goalResponse] = await Promise.all([
          fetch(
            `/api/roadmap?studentId=${encodeURIComponent(userData.id)}`
          ),
          fetch(
            `/api/career-goal?studentId=${encodeURIComponent(userData.id)}`
          ),
        ]);

        if (!roadmapResponse.ok) {
          throw new Error('Failed to load roadmap');
        }

        if (!goalResponse.ok) {
          throw new Error('Failed to load career goal');
        }

        const roadmapResult = await roadmapResponse.json();
        const goalResult = await goalResponse.json();

        setGapAnalysis(roadmapResult.analysis);
        setRoadmapData(roadmapResult.roadmap);
        setCareerGoal(goalResult);

        // Adjustment suggestions are optional because they depend on
        // an existing roadmap and recent learning evidence.
        if (roadmapResult.adjustments) {
          setAdjustments(roadmapResult.adjustments);
        } else {
          setAdjustments(null);
        }
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
    return <LoadingState />;
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

        <Link
          href="/dashboard/career-goal"
          className="mt-5 inline-flex rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Review career goal
        </Link>
      </div>
    );
  }

  if (!careerGoal || !roadmapData) {
    return <SetupState />;
  }

  const weeks = Array.isArray(roadmapData.weeklySchedule)
    ? roadmapData.weeklySchedule
    : [];

  const totalHours =
    typeof roadmapData.totalEstimatedHours === 'number'
      ? roadmapData.totalEstimatedHours
      : 0;

  const weeklyAvailability =
    typeof careerGoal.weeklyAvailability === 'number'
      ? careerGoal.weeklyAvailability
      : null;

  const timelineMonths =
    typeof careerGoal.timelineMonths === 'number'
      ? careerGoal.timelineMonths
      : null;

  const readiness =
    typeof gapAnalysis?.overallReadiness === 'number'
      ? Math.round(gapAnalysis.overallReadiness)
      : null;

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
              {gapAnalysis?.targetRole || careerGoal.targetRole}
            </span>
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
            Your roadmap is generated from your career goal, current skill
            gaps, available learning time and recommended projects.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric
              label="Planned learning"
              value={`${totalHours} hrs`}
            />

            <Metric
              label="Weekly availability"
              value={
                weeklyAvailability !== null
                  ? `${weeklyAvailability} hrs`
                  : 'Not set'
              }
            />

            <Metric
              label="Current readiness"
              value={readiness !== null ? `${readiness}%` : 'Not assessed'}
            />
          </div>
        </div>
      </section>

      {/* Goal summary */}
      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard
          label="Target role"
          value={careerGoal.targetRole || 'Not set'}
          detail="From your career goal"
          icon="◎"
        />

        <InfoCard
          label="Timeline"
          value={
            timelineMonths !== null
              ? `${timelineMonths} ${timelineMonths === 1 ? 'month' : 'months'}`
              : 'Not set'
          }
          detail="Your selected learning window"
          icon="◷"
        />

        <InfoCard
          label="Roadmap weeks"
          value={weeks.length > 0 ? `${weeks.length}` : '—'}
          detail="Generated learning schedule"
          icon="✓"
        />
      </section>

      {/* Timeline */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              Learning timeline
            </p>

            <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Your roadmap
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Follow the sequence generated from your current gaps and goals.
            </p>
          </div>

          {weeks.length > 0 && (
            <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
              {weeks.length} weeks planned
            </span>
          )}
        </div>

        {weeks.length > 0 ? (
          <div className="mt-7 space-y-4">
            {weeks.map((week: any, index: number) => {
              const activities = Array.isArray(week.activities)
                ? week.activities
                : [];

              const weekNumber =
                typeof week.week === 'number' ? week.week : index + 1;

              return (
                <div
                  key={week.id || `week-${weekNumber}`}
                  className="relative rounded-2xl border border-slate-200 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                      {weekNumber}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Week {weekNumber}
                          </p>

                          <h4 className="mt-1 text-lg font-semibold text-slate-950">
                            Learning plan
                          </h4>
                        </div>

                        {typeof week.totalHours === 'number' && (
                          <span className="w-fit rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                            {week.totalHours} hrs
                          </span>
                        )}
                      </div>

                      {week.description && (
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {week.description}
                        </p>
                      )}

                      {activities.length > 0 ? (
                        <div className="mt-4 space-y-2">
                          {activities.map((activity: any, activityIndex: number) => (
                            <div
                              key={
                                activity.id ||
                                `${weekNumber}-${activityIndex}`
                              }
                              className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
                            >
                              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-semibold text-indigo-600 shadow-sm">
                                {activityIndex + 1}
                              </span>

                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-800">
                                  {activity.title ||
                                    activity.name ||
                                    'Learning activity'}
                                </p>

                                {activity.description && (
                                  <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {activity.description}
                                  </p>
                                )}
                              </div>

                              {typeof activity.estimatedHours === 'number' && (
                                <span className="shrink-0 text-xs text-slate-400">
                                  {activity.estimatedHours}h
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
                          No activities are scheduled for this week yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="font-medium text-slate-800">
              No roadmap has been generated yet.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Update your career goal and make sure your learning availability
              and timeline are set.
            </p>

            <Link
              href="/dashboard/career-goal"
              className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Update career goal
            </Link>
          </div>
        )}
      </section>

      {/* Adjustment suggestions */}
      {adjustments?.suggestedChanges?.length ? (
        <section className="rounded-3xl border border-indigo-100 bg-indigo-50/60 p-6 md:p-7">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              Roadmap feedback
            </p>

            <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              {adjustments.title || 'Suggested adjustments'}
            </h3>

            {adjustments.description && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {adjustments.description}
              </p>
            )}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {adjustments.suggestedChanges.map((change, index) => (
              <SuggestionCard
                key={change.title || `suggestion-${index}`}
                title={change.title || 'Roadmap suggestion'}
                description={change.description}
                effort={change.estimatedEffort}
                rationale={change.rationale}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Bottom CTA */}
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-bold text-slate-950">
              Want to change the direction?
            </p>

            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
              Update your career goal and GAPLY will regenerate the planning
              inputs used by your skill analysis, projects and roadmap.
            </p>
          </div>

          <Link
            href="/dashboard/career-goal"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Edit career goal →
          </Link>
        </div>
      </section>
    </div>
  );
}

function LoadingState() {
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

function SetupState() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-xl text-indigo-600">
        ↗
      </div>

      <h2 className="mt-5 text-2xl font-bold text-slate-950">
        Your roadmap needs a few details
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        Complete your career goal, including your target role, timeline and
        weekly learning availability. GAPLY will then generate a roadmap from
        your actual profile and skill gaps.
      </p>

      <Link
        href="/dashboard/career-goal"
        className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
      >
        Set career goal →
      </Link>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-white">{value}</p>
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
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <p className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm text-indigo-600">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">{detail}</p>
    </div>
  );
}

function SuggestionCard({
  title,
  description,
  effort,
  rationale,
}: {
  title: string;
  description?: string;
  effort?: number;
  rationale?: string;
}) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <h4 className="font-semibold text-slate-950">{title}</h4>

        {typeof effort === 'number' && (
          <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
            {effort}h
          </span>
        )}
      </div>

      {description && (
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {description}
        </p>
      )}

      {rationale && (
        <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-400">
          {rationale}
        </p>
      )}
    </div>
  );
}
