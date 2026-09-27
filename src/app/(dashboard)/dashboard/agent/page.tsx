'use client';

import { FormEvent, useEffect, useState } from 'react';

type FocusSkill = {
  skillId: string;
  skillName: string;
  current: number;
  required: number;
  gap: number;
  priorityScore: number;
  rank: number;
  why: string;
};

type PlanItem = {
  title: string;
  type: string;
  hours: number;
  reason?: string;
};

type Project = {
  title?: string;
  name?: string;
  description?: string;
  estimatedHours?: number;
  hours?: number;
  reason?: string;
};

type AgentResponse = {
  answer: string;
  intent: string;
  focusSkills: FocusSkill[];
  plan: PlanItem[];
  projects: Project[];
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

const quickPrompts = [
  'What should I focus on this week?',
  'Why should I learn System Design?',
  'Which project should I build next?',
  'How should I use 10 hours this week?',
];

export default function AgentPage() {
  const [userId, setUserId] = useState('');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('gaply_user');

      if (raw) {
        const user = JSON.parse(raw);
        if (user?.id) {
          setUserId(user.id);
        }
      }
    } catch {
      setError('Unable to load your profile.');
    }
  }, []);

  const askAgent = async (prompt?: string) => {
    const finalQuestion = (prompt ?? question).trim();

    if (!finalQuestion || !userId) return;

    setLoading(true);
    setError('');
    setQuestion(finalQuestion);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: userId,
          question: finalQuestion,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Agent request failed');
      }

      setResponse(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while contacting the agent.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void askAgent();
  };

  const projectName = (project: Project) =>
    project.title || project.name || 'Recommended project';

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950/70 via-[#11111a] to-violet-950/50 p-6 shadow-2xl sm:p-8">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-medium text-indigo-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
              GAPLY AI Career Agent
            </div>

            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
                  Your career path,
                  <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
                    {' '}adapted to you.
                  </span>
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  GAPLY continuously connects your skills, evidence, target role
                  and progress to decide what deserves your attention next.
                </p>
              </div>

              {response && (
                <div className="shrink-0 rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    Target role
                  </p>
                  <p className="mt-1 font-semibold">
                    {response.context.targetRole}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {response.context.weeklyAvailability} hrs/week
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Agent input */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-[#101015] p-4 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Ask your career agent</h2>
            <p className="mt-1 text-sm text-slate-400">
              Ask about priorities, projects, learning time or your skill gaps.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. What should I focus on this week?"
                className="min-h-12 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10"
              />

              <button
                type="submit"
                disabled={loading || !userId || !question.trim()}
                className="min-h-12 rounded-2xl bg-indigo-600 px-6 text-sm font-semibold transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Thinking...' : 'Ask Agent'}
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => void askAgent(prompt)}
                disabled={loading || !userId}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300 transition hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-white disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
        </section>

        {/* Empty state */}
        {!response && !loading && (
          <section className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: '🎯',
                title: 'Prioritize',
                text: 'Find the skills that matter most for your target role.',
              },
              {
                icon: '🧠',
                title: 'Explain',
                text: 'Understand why GAPLY recommends each next step.',
              },
              {
                icon: '🔄',
                title: 'Adapt',
                text: 'Your roadmap changes as your skills and evidence improve.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-[#101015] p-6"
              >
                <div className="text-2xl">{item.icon}</div>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.text}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* Loading */}
        {loading && (
          <section className="mt-6 rounded-3xl border border-white/10 bg-[#101015] p-8">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 animate-pulse rounded-full bg-indigo-400" />
              <p className="text-sm text-slate-300">
                Analyzing your profile, skill gaps and priorities...
              </p>
            </div>
          </section>
        )}

        {response && !loading && (
          <div className="mt-6 space-y-6">

            {/* Agent answer + readiness */}
            <section className="grid gap-6 lg:grid-cols-[1fr_280px]">
              <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/[0.06] p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/15 text-lg">
                    ✦
                  </div>
                  <div>
                    <p className="font-semibold">Agent recommendation</p>
                    <p className="text-xs text-slate-500">
                      {response.intent.replaceAll('_', ' ')}
                    </p>
                  </div>
                </div>

                <p className="text-sm leading-7 text-slate-200">
                  {response.answer}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#101015] p-6">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Career readiness
                </p>

                <div className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-bold">
                    {response.context.readiness}%
                  </span>
                  <span className="pb-1 text-xs text-slate-500">
                    toward target
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, response.context.readiness)
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  {response.sourceData.skillGaps} skill gaps ·{' '}
                  {response.sourceData.prioritizedSkills} priorities ·{' '}
                  {response.sourceData.evidenceCount} evidence items
                </p>
              </div>
            </section>

            {/* Why these skills */}
            <section className="rounded-3xl border border-white/10 bg-[#101015] p-6">
              <div className="mb-6">
                <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
                  Explainable prioritization
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  Why these skills?
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  GAPLY considers the size of the gap, role importance,
                  project relevance, dependencies and assessment confidence.
                </p>
              </div>

              <div className="space-y-3">
                {response.focusSkills.map((skill) => (
                  <div
                    key={skill.skillId}
                    className="rounded-2xl border border-white/8 bg-black/20 p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-sm font-bold text-slate-400">
                          #{skill.rank}
                        </div>

                        <div>
                          <p className="font-medium">{skill.skillName}</p>
                          <p className="text-xs text-slate-500">
                            {skill.current}/100 current ·{' '}
                            {skill.required}/100 required ·{' '}
                            {skill.gap} point gap
                          </p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-sm font-semibold text-indigo-300">
                          {skill.priorityScore}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-600">
                          priority score
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-indigo-500/70"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, skill.current)
                          )}%`,
                        }}
                      />
                    </div>

                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      {skill.why}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Weekly plan */}
            <section className="rounded-3xl border border-white/10 bg-[#101015] p-6">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-violet-400">
                    Adaptive plan
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">
                    What to do next
                  </h2>
                </div>

                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
                  {response.context.weeklyAvailability} hrs/week
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {response.plan.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className="rounded-2xl border border-white/8 bg-black/20 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                        {item.type}
                      </span>
                      <span className="text-xs font-semibold text-indigo-300">
                        {item.hours}h
                      </span>
                    </div>

                    <h3 className="mt-4 text-sm font-semibold">
                      {item.title}
                    </h3>

                    {item.reason && (
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {item.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Projects */}
            {response.projects.length > 0 && (
              <section className="rounded-3xl border border-white/10 bg-[#101015] p-6">
                <div className="mb-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                    Build evidence
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">
                    Projects matched to your gaps
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {response.projects.slice(0, 4).map((project, index) => (
                    <div
                      key={`${projectName(project)}-${index}`}
                      className="rounded-2xl border border-white/8 bg-black/20 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-semibold">
                          {projectName(project)}
                        </h3>

                        {(project.estimatedHours || project.hours) && (
                          <span className="shrink-0 text-xs text-slate-500">
                            {project.estimatedHours || project.hours}h
                          </span>
                        )}
                      </div>

                      {project.description && (
                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          {project.description}
                        </p>
                      )}

                      {project.reason && (
                        <div className="mt-4 rounded-xl bg-emerald-500/5 px-3 py-2 text-xs text-emerald-300/80">
                          {project.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Adaptive loop */}
            <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#101015] to-indigo-950/20 p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
                GAPLY learning loop
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-5">
                {[
                  ['01', 'Assess', 'Measure skills'],
                  ['02', 'Prioritize', 'Find the biggest need'],
                  ['03', 'Learn', 'Target the gap'],
                  ['04', 'Build', 'Create evidence'],
                  ['05', 'Adapt', 'Recalculate'],
                ].map(([number, title, text]) => (
                  <div key={number} className="relative">
                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <p className="text-[10px] font-bold text-indigo-400">
                        {number}
                      </p>
                      <p className="mt-2 text-sm font-semibold">{title}</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}
      </div>
    </main>
  );
}
