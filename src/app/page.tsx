'use client';

import Link from 'next/link';

const steps = [
  {
    number: '01',
    title: 'Build your profile',
    description:
      'Tell GAPLY about your skills, education, experience and how much time you can invest.',
  },
  {
    number: '02',
    title: 'Choose your target',
    description:
      'Set the role you want, your timeline and the technologies you want to work with.',
  },
  {
    number: '03',
    title: 'Find the gap',
    description:
      'GAPLY compares where you are with what your target role actually requires.',
  },
  {
    number: '04',
    title: 'Follow your roadmap',
    description:
      'Get prioritized skills, projects and a week-by-week plan built around your availability.',
  },
];

const features = [
  {
    icon: '◈',
    title: 'Skill Gap Analysis',
    description:
      'Know which skills are holding you back and understand where to focus first.',
  },
  {
    icon: '◇',
    title: 'Project Recommendations',
    description:
      'Build projects that directly strengthen the skills your target role demands.',
  },
  {
    icon: '↗',
    title: 'Personalized Roadmap',
    description:
      'Turn your goal into an actionable learning path instead of another generic course list.',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="relative z-20 border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <Link href="/" className="group">
            <div className="text-2xl font-black tracking-tight">
              GAP<span className="text-indigo-400">LY</span>
            </div>
            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Career intelligence
            </p>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Sign in
            </Link>

            <Link
              href="/signup"
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative">
        {/* Background glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="pointer-events-none absolute right-[-180px] top-40 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-20 md:px-8 md:pb-32 md:pt-28">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-xs font-semibold text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              Career intelligence, built around you
            </div>

            <h1 className="text-5xl font-black tracking-[-0.04em] text-white sm:text-6xl md:text-7xl">
              Stop guessing.
              <br />
              <span className="text-indigo-400">Start closing the gap.</span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
              GAPLY turns your current skills and career goal into a
              personalized path — showing you what to learn, what to build,
              and what to do next.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="w-full rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-950/30 transition hover:bg-indigo-500 sm:w-auto"
              >
                Build my career path
                <span className="ml-2">→</span>
              </Link>

              <Link
                href="/signin"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10 sm:w-auto"
              >
                I already have an account
              </Link>
            </div>
          </div>

          {/* Product preview */}
          <div className="mx-auto mt-20 max-w-5xl">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-2 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                {/* Browser top */}
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />

                  <div className="ml-4 flex-1 rounded-lg bg-white/5 px-4 py-1.5 text-[10px] text-slate-600">
                    app.gaply.dev/dashboard
                  </div>
                </div>

                {/* Dashboard preview */}
                <div className="grid min-h-[310px] md:grid-cols-[180px_1fr]">
                  <div className="hidden border-r border-white/10 bg-slate-950/50 p-4 md:block">
                    <div className="mb-8 text-lg font-black">
                      GAP<span className="text-indigo-400">LY</span>
                    </div>

                    <div className="space-y-2">
                      {['Dashboard', 'Profile', 'Skills', 'Projects', 'Career Goal', 'Roadmap'].map(
                        (item, index) => (
                          <div
                            key={item}
                            className={`rounded-lg px-3 py-2 text-[10px] font-medium ${
                              index === 0
                                ? 'bg-indigo-500/15 text-indigo-300'
                                : 'text-slate-500'
                            }`}
                          >
                            {item}
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="p-5 md:p-7">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-indigo-400">
                      Your workspace
                    </p>

                    <div className="mt-1 flex items-end justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          Hey, Divyansh. Let&apos;s close the gap.
                        </h3>
                        <p className="mt-1 text-[10px] text-slate-500">
                          Here&apos;s what you should focus on next.
                        </p>
                      </div>

                      <div className="hidden rounded-lg bg-indigo-600 px-3 py-2 text-[9px] font-semibold sm:block">
                        View roadmap →
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <PreviewCard
                        label="Skills assessed"
                        value="8"
                        detail="3 strong"
                      />
                      <PreviewCard
                        label="Skills with gap"
                        value="5"
                        detail="Needs focus"
                      />
                      <PreviewCard
                        label="Readiness"
                        value="62%"
                        detail="Keep building"
                      />
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-slate-300">
                            Current focus
                          </span>
                          <span className="text-[9px] text-indigo-400">
                            Priority
                          </span>
                        </div>

                        <div className="mt-4 space-y-3">
                          <PreviewSkill name="System Design" value={28} />
                          <PreviewSkill name="Testing" value={42} />
                          <PreviewSkill name="Node.js" value={58} />
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                        <span className="text-[10px] font-semibold text-slate-300">
                          Next milestone
                        </span>

                        <div className="mt-4 rounded-lg bg-indigo-500/10 p-3">
                          <p className="text-[10px] font-bold text-indigo-300">
                            Build a full-stack project
                          </p>
                          <p className="mt-1 text-[9px] leading-4 text-slate-500">
                            Strengthen Node.js, PostgreSQL and API design.
                          </p>
                        </div>

                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                          <div className="h-full w-[68%] rounded-full bg-indigo-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-[10px] text-slate-600">
              A glimpse of your personalized career workspace
            </p>
          </div>
        </div>
      </section>

      {/* Positioning */}
      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 md:grid-cols-3 md:px-8">
          <PositioningItem
            number="01"
            title="Know where you stand"
            text="Understand your current skill level instead of relying on guesswork."
          />
          <PositioningItem
            number="02"
            title="Know what matters"
            text="Prioritize the skills that actually move you toward your target role."
          />
          <PositioningItem
            number="03"
            title="Know what to do next"
            text="Turn your career goal into concrete learning and project milestones."
          />
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-24 text-slate-950 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              One workspace
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Everything you need to move forward.
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-500">
              GAPLY connects your goal, skills, projects and learning plan
              instead of treating them as separate problems.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-3xl border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-lg text-white shadow-lg shadow-indigo-200">
                  {feature.icon}
                </div>

                <h3 className="mt-6 text-lg font-bold">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-24 text-slate-950 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                How GAPLY works
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                From where you are
                <br />
                to where you want to be.
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-slate-500">
              No generic checklist. Your path is based on your starting point,
              target role and available time.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div className="absolute left-[calc(100%+4px)] top-7 hidden h-px w-4 bg-slate-300 md:block" />
                )}

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <span className="text-xs font-black tracking-wider text-indigo-600">
                    {step.number}
                  </span>

                  <h3 className="mt-5 text-lg font-bold">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-950 py-24">
        <div className="mx-auto max-w-4xl px-5 text-center md:px-8">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-xl shadow-xl shadow-indigo-950">
            ✦
          </div>

          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            Your career goal deserves
            <span className="text-indigo-400"> a real plan.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Stop collecting random tutorials. Start building the skills and
            projects that take you where you actually want to go.
          </p>

          <Link
            href="/signup"
            className="mt-8 inline-flex rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
          >
            Start with GAPLY
            <span className="ml-2">→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left md:px-8">
          <div>
            <div className="text-lg font-black">
              GAP<span className="text-indigo-400">LY</span>
            </div>
            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-600">
              Career intelligence
            </p>
          </div>

          <p className="text-xs text-slate-600">
            Built for Bit N Build &apos;26 · Education & Employability
          </p>
        </div>
      </footer>
    </main>
  );
}

function PreviewCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <p className="text-[9px] font-medium text-slate-500">{label}</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-xl font-black text-white">{value}</span>
        <span className="mb-0.5 text-[8px] text-slate-600">{detail}</span>
      </div>
    </div>
  );
}

function PreviewSkill({
  name,
  value,
}: {
  name: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-[9px]">
        <span className="text-slate-400">{name}</span>
        <span className="text-slate-600">{value}%</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-indigo-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function PositioningItem({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div>
      <span className="text-xs font-black tracking-wider text-indigo-400">
        {number}
      </span>

      <h3 className="mt-3 text-lg font-bold text-white">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}
