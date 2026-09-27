'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ProjectsPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
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
          `/api/projects?studentId=${encodeURIComponent(userData.id)}`
        );

        if (!response.ok) {
          throw new Error('Failed to load projects');
        }

        const data = await response.json();

        setGapAnalysis(data.analysis);
        setRecommendations(data.recommendations || []);
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError('Failed to load project recommendations.');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
          <p className="mt-4 text-sm text-slate-500">
            Finding projects for you...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          !
        </div>
        <h2 className="mt-4 text-lg font-semibold text-red-900">
          Recommendations unavailable
        </h2>
        <p className="mt-1 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  const readiness = gapAnalysis?.overallReadiness || 0;
  const targetRole = gapAnalysis?.targetRole || 'your target role';

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl md:p-9">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg">
            ▣
          </div>

          <p className="text-sm font-medium text-indigo-300">
            Project recommendations
          </p>

          <h2 className="mt-1 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
            Build projects that{' '}
            <span className="text-indigo-300">close your skill gaps.</span>
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
            These projects are selected around your current skills and your
            goal of becoming a {targetRole}.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Projects found
              </p>
              <p className="mt-1 text-lg font-bold">
                {recommendations.length}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Current readiness
              </p>
              <p className="mt-1 text-lg font-bold">{readiness}%</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Focus
              </p>
              <p className="mt-1 text-lg font-bold">Skill gaps</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
            Recommended for you
          </p>

          <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            Projects worth building
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Start with projects that give you the most relevant hands-on
            experience.
          </p>
        </div>

        {recommendations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              ▣
            </div>
            <h4 className="mt-4 font-semibold text-slate-800">
              No recommendations yet
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              Complete your skills and career goal information to generate
              project recommendations.
            </p>
            <Link
              href="/dashboard/skills"
              className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Analyze skills →
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {recommendations.map((project, index) => (
              <ProjectCard
                key={project.projectId || index}
                project={project}
                index={index}
              />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
            How it works
          </p>

          <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            Why these projects?
          </h3>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            GAPLY connects your skill gaps with practical projects instead of
            giving you a generic project list.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            number="01"
            icon="◎"
            title="Personalized matching"
            description="Projects are evaluated against your specific skills and career goal."
          />

          <FeatureCard
            number="02"
            icon="◆"
            title="Skill coverage"
            description="See which skills each project helps you practice and strengthen."
          />

          <FeatureCard
            number="03"
            icon="↗"
            title="Readiness impact"
            description="Build practical experience that moves you closer to your target role."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-7 md:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              Next step
            </p>

            <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Turn these projects into a learning plan.
            </h3>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Use your personalized roadmap to decide what to learn and build
              each week.
            </p>
          </div>

          <Link
            href="/dashboard/roadmap"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            View roadmap
            <span className="ml-2">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

function ProjectCard({
  project,
  index,
}: {
  project: any;
  index: number;
}) {
  const addressedSkills = Array.isArray(project.addressedSkills)
    ? project.addressedSkills
    : [];

  const missingSkills = Array.isArray(project.missingSkills)
    ? project.missingSkills
    : [];

  const coverage = Math.round(project.coverageScore || 0);

  const difficulty = String(project.difficulty || 'medium');

  const difficultyStyle =
    difficulty.toLowerCase() === 'easy'
      ? 'bg-emerald-50 text-emerald-700'
      : difficulty.toLowerCase() === 'hard'
        ? 'bg-orange-50 text-orange-700'
        : 'bg-amber-50 text-amber-700';

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-1 hover:border-indigo-100 hover:shadow-lg md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
            {String(index + 1).padStart(2, '0')}
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-600">
              Project
            </p>

            <h4 className="mt-1 truncate text-lg font-bold text-slate-950">
              {project.projectName}
            </h4>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
          {coverage}% match
        </span>
      </div>

      <p className="mt-5 text-sm leading-6 text-slate-500">
        {project.projectDescription}
      </p>

      {/* Coverage */}
      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">
            Skill coverage
          </span>
          <span className="text-xs font-bold text-indigo-600">
            {coverage}%
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500"
            style={{ width: `${Math.min(coverage, 100)}%` }}
          />
        </div>
      </div>

      {/* Skills addressed */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            Skills addressed
          </h5>

          <span className="text-xs text-slate-400">
            {addressedSkills.length}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {addressedSkills.map((skill: any) => (
            <span
              key={skill.skillId || skill.skillName}
              className="rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700"
            >
              {skill.skillName}
            </span>
          ))}
        </div>
      </div>

      {/* Missing skills */}
      {missingSkills.length > 0 && (
        <div className="mt-5">
          <h5 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            Still needs work
          </h5>

          <div className="mt-3 flex flex-wrap gap-2">
            {missingSkills.map((skill: any) => (
              <span
                key={skill.skillId || skill.skillName}
                className="rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700"
              >
                {skill.skillName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Meta */}
      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Effort
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {project.estimatedHours} hours
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Difficulty
          </p>
          <span
            className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${difficultyStyle}`}
          >
            {difficulty}
          </span>
        </div>
      </div>
    </article>
  );
}

function FeatureCard({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 transition hover:bg-white hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
          {icon}
        </div>

        <span className="text-xs font-bold text-slate-300">{number}</span>
      </div>

      <h4 className="mt-5 font-semibold text-slate-950">{title}</h4>

      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
