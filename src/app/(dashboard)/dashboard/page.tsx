'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
};

type SkillGap = {
  skillId: string;
  skillName: string;
  currentProficiency: number;
  requiredProficiency: number;
  gap: number;
};

type SkillResponse = {
  analysis: {
    targetRole: string;
    skillGaps: SkillGap[];
    overallReadiness: number;
  } | null;
  priorities: unknown[];
  needsSetup?: boolean;
};

type ProjectResponse = {
  recommendations: unknown[];
  analysis: {
    overallReadiness: number;
  } | null;
  needsSetup?: boolean;
};

type Stats = {
  skillsAssessed: number;
  skillsWithDeficit: number;
  projectsToBuild: number;
  overallReadiness: number | null;
  targetRole: string | null;
  needsSetup: boolean;
};


type AgentFocusSkill = {
  skillId: string;
  skillName: string;
  current: number;
  required: number;
  gap: number;
  priorityScore: number;
  rank: number;
  why: string;
};

type AgentPlanItem = {
  title: string;
  type: 'LEARN' | 'BUILD' | 'PRACTICE';
  hours: number;
  reason: string;
};

type AgentResponse = {
  answer: string;
  intent: string;
  focusSkills: AgentFocusSkill[];
  plan: AgentPlanItem[];
  projects: Array<{
    projectId: string;
    projectName: string;
    estimatedHours: number;
    difficulty: string;
    explanation: string;
  }>;
  context: {
    targetRole: string;
    weeklyAvailability: number;
    readiness: number;
  };
  sourceData: {
    skillGaps: number;
    prioritizedSkills: number;
    evidenceCount: number;
  };
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({
    skillsAssessed: 0,
    skillsWithDeficit: 0,
    projectsToBuild: 0,
    overallReadiness: null,
    targetRole: null,
    needsSetup: true,
  });

  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState('');


  const [agentQuestion, setAgentQuestion] = useState(
    'What should I focus on this week?'
  );
  const [agentResponse, setAgentResponse] =
    useState<AgentResponse | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('gaply_user');

    if (!storedUser) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as User;

      if (!parsedUser?.id) {
        localStorage.removeItem('gaply_user');
        setUser(null);
        setAuthLoading(false);
        return;
      }

      setUser(parsedUser);
      setAuthLoading(false);
      loadDashboardData(parsedUser.id);
    } catch (error) {
      console.error('Failed to read stored user:', error);
      localStorage.removeItem('gaply_user');
      setUser(null);
      setAuthLoading(false);
    }
  }, []);

  async function loadDashboardData(studentId: string) {
    setDataLoading(true);
    setError('');

    try {
      const [skillsResponse, projectsResponse] = await Promise.all([
        fetch(`/api/skills?studentId=${encodeURIComponent(studentId)}`),
        fetch(`/api/projects?studentId=${encodeURIComponent(studentId)}`),
      ]);

      const skillsData =
        (await skillsResponse.json()) as SkillResponse;

      const projectsData =
        (await projectsResponse.json()) as ProjectResponse;

      if (!skillsResponse.ok && !projectsResponse.ok) {
        throw new Error(
          skillsData && 'error' in skillsData
            ? String((skillsData as unknown as { error: string }).error)
            : 'Failed to load dashboard data'
        );
      }

      const analysis = skillsData.analysis;

      const skillGaps = Array.isArray(analysis?.skillGaps)
        ? analysis.skillGaps
        : [];

      const skillsWithDeficit = skillGaps.filter(
        (skill) => skill.gap < 0
      ).length;

      const recommendations = Array.isArray(
        projectsData?.recommendations
      )
        ? projectsData.recommendations
        : [];

      setStats({
        skillsAssessed: skillGaps.filter(
          (skill) => skill.currentProficiency > 0
        ).length,
        skillsWithDeficit,
        projectsToBuild: recommendations.length,
        overallReadiness:
          typeof analysis?.overallReadiness === 'number'
            ? analysis.overallReadiness
            : null,
        targetRole: analysis?.targetRole ?? null,
        needsSetup:
          Boolean(skillsData?.needsSetup) ||
          Boolean(projectsData?.needsSetup) ||
          !analysis,
      });
    } catch (error) {
      console.error('Dashboard data error:', error);

      setError(
        error instanceof Error
          ? error.message
          : 'Unable to load your dashboard data.'
      );

      setStats({
        skillsAssessed: 0,
        skillsWithDeficit: 0,
        projectsToBuild: 0,
        overallReadiness: null,
        targetRole: null,
        needsSetup: true,
      });
    } finally {
      setDataLoading(false);
    }
  }

  async function askAgent(questionOverride?: string) {
    if (!user?.id) return;

    const question = (questionOverride ?? agentQuestion).trim();

    if (!question) {
      setAgentError('Ask the Career Agent a question first.');
      return;
    }

    setAgentQuestion(question);
    setAgentLoading(true);
    setAgentError('');

    try {
      const hourMatch = question.match(
        /(\\d+(?:\\.\\d+)?)\\s*(?:hours?|hrs?|h)\\b/i
      );

      const availableHours = hourMatch
        ? Number(hourMatch[1])
        : undefined;

      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: user.id,
          question,
          availableHours,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data?.error === 'string'
            ? data.error
            : 'Career Agent could not generate a response.'
        );
      }

      setAgentResponse(data as AgentResponse);
    } catch (error) {
      console.error('Career Agent error:', error);

      setAgentError(
        error instanceof Error
          ? error.message
          : 'Unable to reach the Career Agent.'
      );
    } finally {
      setAgentLoading(false);
    }
  }

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
    if (typeof window !== 'undefined') {
      window.location.href = '/signin';
    }

    return null;
  }

  const firstName =
    user.name?.split(' ')[0] || 'there';

  const readiness = stats.overallReadiness;
  const readinessLabel =
    readiness === null ? 'Not assessed' : `${readiness}%`;

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
            {stats.targetRole
              ? `Your dashboard is tracking your progress toward becoming a ${stats.targetRole}.`
              : 'Set your career goal and skills to unlock your personalized GAPLY analysis.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={
                stats.needsSetup
                  ? '/dashboard/career-goal'
                  : '/dashboard/roadmap'
              }
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              {stats.needsSetup
                ? 'Set career goal →'
                : 'View roadmap →'}
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

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Skills assessed"
          value={dataLoading ? '—' : stats.skillsAssessed}
          detail={
            stats.needsSetup
              ? 'add skills to begin'
              : 'skills currently analyzed'
          }
          icon="◆"
        />

        <StatCard
          label="Skills to improve"
          value={dataLoading ? '—' : stats.skillsWithDeficit}
          detail={
            stats.skillsWithDeficit > 0
              ? 'need attention'
              : stats.needsSetup
                ? 'analysis not started'
                : 'no current deficits'
          }
          icon="↗"
        />

        <StatCard
          label="Projects to build"
          value={dataLoading ? '—' : stats.projectsToBuild}
          detail={
            stats.projectsToBuild > 0
              ? 'recommended for your gaps'
              : 'no recommendations yet'
          }
          icon="▣"
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Overall readiness
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {dataLoading ? '—' : readinessLabel}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-sm text-emerald-600">
              ↗
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all"
              style={{
                width: `${readiness ?? 0}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs text-slate-400">
            {readiness === null
              ? 'complete your career setup to get assessed'
              : 'of required role skills currently met'}
          </p>
        </div>
      </section>

      {/* AI Career Agent */}
      {!stats.needsSetup && (
        <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white md:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/20">
                    ✦
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">
                      AI Career Agent
                    </p>
                    <h3 className="mt-0.5 text-xl font-bold tracking-tight">
                      Your next move, explained.
                    </h3>
                  </div>
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
                  Ask GAPLY what to learn, what to build, or why a skill is
                  prioritized. Recommendations are generated from your target
                  role, current skills, evidence, projects and progress.
                </p>
              </div>

              {stats.targetRole && (
                <div className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Target role
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {stats.targetRole}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                value={agentQuestion}
                onChange={(event) => setAgentQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !agentLoading) {
                    void askAgent();
                  }
                }}
                placeholder="Ask about your career path..."
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              />

              <button
                type="button"
                onClick={() => void askAgent()}
                disabled={agentLoading}
                className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {agentLoading ? 'Thinking...' : 'Ask Agent →'}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                'What should I focus on this week?',
                'Why should I learn System Design?',
                'What project should I build next?',
                'I have 10 hours this week',
              ].map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => {
                    setAgentQuestion(question);
                    void askAgent(question);
                  }}
                  disabled={agentLoading}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-white disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {agentError && (
            <div className="border-b border-red-100 bg-red-50 px-6 py-4 text-sm text-red-700">
              {agentError}
            </div>
          )}

          {agentResponse ? (
            <div className="grid gap-6 p-6 md:p-7 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                  Agent reasoning
                </p>

                <p className="mt-3 text-base font-medium leading-7 text-slate-800">
                  {agentResponse.answer}
                </p>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <AgentMetric
                    label="Readiness"
                    value={`${agentResponse.context.readiness}%`}
                  />
                  <AgentMetric
                    label="Skill gaps"
                    value={agentResponse.sourceData.skillGaps}
                  />
                  <AgentMetric
                    label="Evidence"
                    value={agentResponse.sourceData.evidenceCount}
                  />
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-950">
                        Priority skills
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Based on gap, role importance, project relevance and
                        assessment confidence.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {agentResponse.focusSkills.map((skill) => (
                      <div
                        key={skill.skillId}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-[10px] font-bold text-indigo-700">
                                #{skill.rank}
                              </span>

                              <p className="text-sm font-bold text-slate-900">
                                {skill.skillName}
                              </p>
                            </div>

                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              {skill.why}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-sm font-bold text-slate-900">
                              {skill.current}
                              <span className="font-normal text-slate-400">
                                {' '}
                                / {skill.required}
                              </span>
                            </p>
                            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              current / target
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500"
                            style={{
                              width: `${Math.min(
                                100,
                                (skill.current / Math.max(skill.required, 1)) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                    Recommended plan
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-950">
                    {agentResponse.context.weeklyAvailability} hours available
                  </p>

                  <div className="mt-4 space-y-3">
                    {agentResponse.plan.map((item, index) => (
                      <div
                        key={`${item.title}-${index}`}
                        className="flex gap-3 rounded-xl bg-white p-3.5 shadow-sm"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900">
                              {item.title}
                            </p>

                            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                              {item.hours}h
                            </span>
                          </div>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {item.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {agentResponse.projects.length > 0 && (
                  <div className="mt-5">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                          Project match
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-950">
                          Build evidence for your gaps
                        </p>
                      </div>

                      <Link
                        href="/dashboard/projects"
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        View all →
                      </Link>
                    </div>

                    <div className="mt-3 space-y-2">
                      {agentResponse.projects.slice(0, 2).map((project) => (
                        <div
                          key={project.projectId}
                          className="rounded-xl border border-slate-200 bg-white p-3.5"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900">
                              {project.projectName}
                            </p>

                            <span className="text-xs text-slate-400">
                              {project.estimatedHours}h · {project.difficulty}
                            </span>
                          </div>

                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                            {project.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 md:p-7">
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                  ✦
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-900">
                  Ask GAPLY what to do next.
                </p>

                <p className="mx-auto mt-1 max-w-lg text-xs leading-5 text-slate-500">
                  The agent will use your actual skill gaps, role requirements,
                  evidence and project matches to explain its recommendation.
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Setup prompt */}
      {stats.needsSetup && !dataLoading && (
        <section className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                Get started
              </p>

              <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                Your personalized analysis starts with your career goal.
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Tell GAPLY what role you are targeting, then add your current
                skills. We&apos;ll calculate the gaps and recommend projects
                based on your actual profile.
              </p>
            </div>

            <Link
              href="/dashboard/career-goal"
              className="shrink-0 rounded-xl bg-indigo-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Set career goal
            </Link>
          </div>
        </section>
      )}

      {/* Main content */}
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Quick actions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              Next steps
            </p>

            <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
              {stats.needsSetup
                ? 'Build your GAPLY profile'
                : 'Keep your momentum going'}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {stats.needsSetup
                ? 'Complete the basics so GAPLY can personalize your path.'
                : 'Use your analysis to decide what to work on next.'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ActionCard
              href="/dashboard/profile"
              icon="◉"
              title="Update profile"
              description="Keep your education and availability current."
            />

            <ActionCard
              href="/dashboard/skills"
              icon="◆"
              title="Add & analyze skills"
              description="Tell GAPLY what you already know."
            />

            <ActionCard
              href="/dashboard/projects"
              icon="▣"
              title="Explore projects"
              description="Find projects matched to your skill gaps."
            />

            <ActionCard
              href="/dashboard/roadmap"
              icon="↗"
              title="View roadmap"
              description="Follow your personalized learning path."
            />
          </div>
        </div>

        {/* Current status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              Current status
            </p>

            <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
              {stats.needsSetup
                ? 'Nothing is being assumed'
                : 'Your analysis is live'}
            </h3>
          </div>

          {stats.needsSetup ? (
            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                ✦
              </div>

              <h4 className="mt-4 text-sm font-semibold text-slate-900">
                Start with your real information
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                GAPLY won&apos;t show sample skills, fake progress, or
                placeholder readiness. Your dashboard updates from your own
                profile, skills, goals and recommendations.
              </p>

              <Link
                href="/dashboard/career-goal"
                className="mt-4 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Configure career goal →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <StatusRow
                label="Target role"
                value={stats.targetRole || 'Not set'}
              />

              <StatusRow
                label="Skills with data"
                value={`${stats.skillsAssessed}`}
              />

              <StatusRow
                label="Skill gaps"
                value={`${stats.skillsWithDeficit}`}
              />

              <StatusRow
                label="Recommended projects"
                value={`${stats.projectsToBuild}`}
              />

              <StatusRow
                label="Readiness"
                value={readinessLabel}
              />

              <Link
                href="/dashboard/roadmap"
                className="block rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Continue learning →
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function AgentMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
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
  value: string | number;
  detail: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

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

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="max-w-[55%] truncate text-right text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}
