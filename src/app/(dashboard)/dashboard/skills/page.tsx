'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SkillsPage() {
  const [gapAnalysis, setGapAnalysis] = useState<any>({
    targetRole: '',
    overallReadiness: 0,
    skillGaps: [],
    prioritySkills: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSkills = async () => {
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
          `/api/skills?studentId=${encodeURIComponent(userData.id)}`
        );

        if (!response.ok) {
          throw new Error('Failed to load skills');
        }

        const data = await response.json();

        setGapAnalysis(
          data.analysis || {
            targetRole: '',
            overallReadiness: 0,
            skillGaps: [],
            prioritySkills: [],
          }
        );
      } catch (err) {
        console.error('Failed to load skills:', err);
        setError('Failed to load skill analysis.');
      } finally {
        setLoading(false);
      }
    };

    loadSkills();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
          <p className="mt-4 text-sm text-slate-500">
            Analyzing your skills...
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
          Something went wrong
        </h2>

        <p className="mt-1 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  const readiness = Math.round(gapAnalysis.overallReadiness || 0);
  const skillGaps = gapAnalysis.skillGaps || [];
  const prioritySkills = gapAnalysis.prioritySkills || [];

  const strengths = skillGaps.filter((skill: any) => skill.gap >= 0);
  const gaps = skillGaps.filter((skill: any) => skill.gap < 0);

  return (
    <div className="space-y-6">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl md:p-9">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">

          <div>
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg">
              ◆
            </div>

            <p className="text-sm font-medium text-indigo-300">
              Skill intelligence
            </p>

            <h2 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
              Your path to becoming a{' '}
              <span className="text-indigo-300">
                {gapAnalysis.targetRole || 'professional'}
              </span>
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              We compared your current skills against what your target role
              requires to identify where you should focus next.
            </p>

            <div className="mt-6 max-w-xl">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-slate-400">Overall readiness</span>
                <span className="font-semibold text-white">
                  {readiness}%
                </span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400"
                  style={{ width: `${Math.min(readiness, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-start lg:justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
              <div
                className="absolute inset-2 rounded-full"
                style={{
                  background: `conic-gradient(rgb(129 140 248) ${readiness * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
                }}
              />

              <div className="relative flex h-28 w-28 flex-col items-center justify-center rounded-full bg-slate-950">
                <span className="text-3xl font-bold">{readiness}%</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500">
                  ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <OverviewCard
          label="Skills analyzed"
          value={skillGaps.length}
          detail="Across your target role"
          icon="◆"
        />

        <OverviewCard
          label="Skills to improve"
          value={gaps.length}
          detail="Areas that need attention"
          icon="↗"
        />

        <OverviewCard
          label="Current strengths"
          value={strengths.length}
          detail="Skills meeting requirements"
          icon="✓"
        />
      </section>

      {/* Skills */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              Skill breakdown
            </p>

            <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Where you stand
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Compare your current proficiency with the level your role needs.
            </p>
          </div>

          <div className="flex gap-2 text-xs">
            <span className="rounded-full bg-red-50 px-3 py-1.5 font-medium text-red-600">
              Needs work
            </span>

            <span className="rounded-full bg-emerald-50 px-3 py-1.5 font-medium text-emerald-600">
              On track
            </span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {skillGaps.map((skill: any) => (
            <SkillCard key={skill.skillId} skill={skill} />
          ))}
        </div>

        {skillGaps.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <p className="font-medium text-slate-700">
              No skill analysis available yet.
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Add your skills and career goal to generate an analysis.
            </p>
          </div>
        )}
      </section>

      {/* Priority */}
      {prioritySkills.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              Recommended focus
            </p>

            <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              What to learn next
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Your highest-impact skills are prioritized below.
            </p>
          </div>

          <div className="space-y-3">
            {prioritySkills.map((skillId: any, index: number) => {
              const skill = skillGaps.find(
                (item: any) => item.skillId === skillId
              );

              if (!skill) return null;

              return (
                <div
                  key={skillId}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-indigo-100 hover:bg-indigo-50/40"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-slate-900">
                        {skill.skillName}
                      </h4>

                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-red-600">
                        {Math.abs(skill.gap)} pt gap
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Focus on this skill to improve your readiness for{' '}
                      {gapAnalysis.targetRole || 'your target role'}.
                    </p>
                  </div>

                  <span className="hidden text-slate-300 transition group-hover:text-indigo-400 sm:block">
                    →
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-7 md:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              Turn gaps into experience
            </p>

            <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Build projects around your weakest skills.
            </h3>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              The fastest way to strengthen a skill is to use it. Explore
              project recommendations tailored to your current gaps.
            </p>
          </div>

          <Link
            href="/dashboard/projects"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Explore projects
            <span className="ml-2">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

function OverviewCard({
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

function SkillCard({ skill }: { skill: any }) {
  const gap = skill.gap || 0;
  const gapAbs = Math.abs(gap);
  const isStrength = gap >= 0;

  const severity =
    gapAbs <= 15
      ? 'Low'
      : gapAbs <= 30
        ? 'Medium'
        : 'High';

  const severityStyle =
    gapAbs <= 15
      ? 'bg-amber-50 text-amber-600'
      : gapAbs <= 30
        ? 'bg-orange-50 text-orange-600'
        : 'bg-red-50 text-red-600';

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 transition hover:border-slate-200 hover:bg-white hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-semibold text-slate-950">
            {skill.skillName}
          </h4>

          <p className="mt-1 text-xs text-slate-400">
            {isStrength ? 'Strong area' : 'Development area'}
          </p>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
            isStrength
              ? 'bg-emerald-50 text-emerald-600'
              : severityStyle
          }`}
        >
          {isStrength ? 'On track' : `${severity} gap`}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <SkillBar
          label="Your level"
          value={skill.currentProficiency}
          type="current"
        />

        <SkillBar
          label="Required"
          value={skill.requiredProficiency}
          type="required"
        />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-200/70 pt-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Gap
          </p>

          <p
            className={`mt-1 text-sm font-bold ${
              isStrength ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {isStrength ? `+${gap}` : `-${gapAbs}`} pts
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Confidence
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {Math.round((skill.confidence || 0) * 100)}%
          </p>
        </div>
      </div>

      {skill.explanation && (
        <p className="mt-4 rounded-xl bg-white/80 p-3 text-xs leading-5 text-slate-500">
          {skill.explanation}
        </p>
      )}
    </div>
  );
}

function SkillBar({
  label,
  value,
  type,
}: {
  label: string;
  value: number;
  type: 'current' | 'required';
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>

        <span className="text-xs font-bold text-slate-700">
          {value}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${
            type === 'current'
              ? 'bg-indigo-600'
              : 'bg-slate-400'
          }`}
          style={{ width: `${Math.min(value || 0, 100)}%` }}
        />
      </div>
    </div>
  );
}
