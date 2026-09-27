'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const emptyForm = {
  targetRole: '',
  experienceLevel: '' as 'Beginner' | 'Intermediate' | 'Advanced' | '',
  timelineMonths: '',
  preferredTechnologies: '',
  weeklyAvailability: '',
};

export default function CareerGoalPage() {
  const [user, setUser] = useState<any>(null);
  const [careerGoal, setCareerGoal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('gaply_user');

    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      loadCareerGoal(userData.id);
    } else {
      setUser(null);
    }

    setAuthLoading(false);

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'gaply_user') {
        if (e.newValue) {
          const newUser = JSON.parse(e.newValue);
          setUser(newUser);
          loadCareerGoal(newUser.id);
        } else {
          setUser(null);
          setCareerGoal(null);
          setShowForm(false);
          setFormData(emptyForm);
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  const loadCareerGoal = async (studentId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/career-goal?studentId=${encodeURIComponent(studentId)}`
      );

      if (!response.ok) {
        throw new Error('Failed to load career goal');
      }

      const existingGoal = await response.json();

      if (existingGoal) {
        setCareerGoal(existingGoal);

        setFormData({
          targetRole: existingGoal.targetRole || '',
          experienceLevel: existingGoal.experienceLevel || '',
          timelineMonths: existingGoal.timelineMonths?.toString() || '',
          preferredTechnologies: Array.isArray(
            existingGoal.preferredTechnologies
          )
            ? existingGoal.preferredTechnologies.join(', ')
            : '',
          weeklyAvailability:
            existingGoal.weeklyAvailability?.toString() || '',
        });
      }
    } catch (err) {
      console.error('Failed to load career goal:', err);
      setError('Failed to load career goal.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const timelineMonths = formData.timelineMonths
        ? parseInt(formData.timelineMonths, 10)
        : null;

      const weeklyAvailability = formData.weeklyAvailability
        ? parseInt(formData.weeklyAvailability, 10)
        : null;

      const response = await fetch('/api/career-goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: user.id,
          targetRole: formData.targetRole.trim(),
          experienceLevel: formData.experienceLevel,
          timelineMonths,
          preferredTechnologies: formData.preferredTechnologies
            .split(',')
            .map((tech: string) => tech.trim())
            .filter((tech: string) => tech.length > 0),
          weeklyAvailability,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save career goal');
      }

      const result = await response.json();

      setCareerGoal(result);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save career goal:', err);
      setError('Failed to save career goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);

    if (careerGoal) {
      setFormData({
        targetRole: careerGoal.targetRole || '',
        experienceLevel: careerGoal.experienceLevel || '',
        timelineMonths: careerGoal.timelineMonths?.toString() || '',
        preferredTechnologies: Array.isArray(
          careerGoal.preferredTechnologies
        )
          ? careerGoal.preferredTechnologies.join(', ')
          : String(careerGoal.preferredTechnologies || ''),
        weeklyAvailability:
          careerGoal.weeklyAvailability?.toString() || '',
      });
    } else {
      setFormData(emptyForm);
    }
  };

  if (authLoading) {
    return <LoadingState text="Checking your account..." />;
  }

  if (!user) {
    window.location.href = '/signin';
    return null;
  }

  if (loading && !careerGoal) {
    return <LoadingState text="Loading your career goal..." />;
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl md:p-9">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg">
            ◎
          </div>

          <p className="text-sm font-medium text-indigo-300">
            Career direction
          </p>

          <h2 className="mt-1 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
            {careerGoal ? (
              <>
                Your goal:{' '}
                <span className="text-indigo-300">
                  {careerGoal.targetRole}
                </span>
              </>
            ) : (
              <>
                Define where you want to{' '}
                <span className="text-indigo-300">go next.</span>
              </>
            )}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
            Set your target role, learning timeline and technology preferences
            so GAPLY can personalize your skill analysis, projects and roadmap.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {careerGoal ? (
              <>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Timeline
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {careerGoal.timelineMonths
                      ? `${careerGoal.timelineMonths} months`
                      : 'Flexible'}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Weekly focus
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {careerGoal.weeklyAvailability
                      ? `${careerGoal.weeklyAvailability} hrs`
                      : 'Flexible'}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Level
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {careerGoal.experienceLevel || 'Not set'}
                  </p>
                </div>
              </>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Set your career goal →
              </button>
            )}
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* Main goal card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              Your career target
            </p>

            <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              {careerGoal ? 'Your current goal' : 'Create your career goal'}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {careerGoal
                ? 'Keep these details updated as your plans evolve.'
                : 'Tell GAPLY what you are working towards.'}
            </p>
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              {careerGoal ? 'Update goal' : 'Set goal'}
              <span className="ml-2">→</span>
            </button>
          )}

          {showForm && (
            <button
              onClick={handleCancel}
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                label="Target role"
                hint="The role you are preparing for."
                className="md:col-span-2"
              >
                <input
                  type="text"
                  value={formData.targetRole}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetRole: e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="e.g. Full Stack Developer"
                  required
                />
              </FormField>

              <FormField
                label="Experience level"
                hint="Choose your current level."
              >
                <select
                  value={formData.experienceLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experienceLevel: e.target.value as any,
                    })
                  }
                  className={inputClass}
                >
                  <option value="">Select experience level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </FormField>

              <FormField
                label="Timeline"
                hint="How long do you plan to work towards this goal?"
              >
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={formData.timelineMonths}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timelineMonths: e.target.value,
                      })
                    }
                    className={`${inputClass} pr-20`}
                    placeholder="6"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-slate-400">
                    months
                  </span>
                </div>
              </FormField>

              <FormField
                label="Preferred technologies"
                hint="Separate technologies with commas."
                className="md:col-span-2"
              >
                <input
                  type="text"
                  value={formData.preferredTechnologies}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferredTechnologies: e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="JavaScript, React, Node.js, PostgreSQL"
                />
              </FormField>

              <FormField
                label="Weekly availability"
                hint="Hours you can dedicate to learning each week."
              >
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={formData.weeklyAvailability}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weeklyAvailability: e.target.value,
                      })
                    }
                    className={`${inputClass} pr-16`}
                    placeholder="10"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-slate-400">
                    hrs/wk
                  </span>
                </div>
              </FormField>
            </div>

            <div className="flex flex-col justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Saving...' : 'Save career goal →'}
              </button>
            </div>
          </form>
        )}

        {!showForm && careerGoal && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <GoalDetail
              label="Target role"
              value={careerGoal.targetRole}
              icon="◎"
              highlight
            />

            <GoalDetail
              label="Experience level"
              value={careerGoal.experienceLevel || 'Not specified'}
              icon="◆"
            />

            <GoalDetail
              label="Timeline"
              value={
                careerGoal.timelineMonths
                  ? `${careerGoal.timelineMonths} months`
                  : 'Not specified'
              }
              icon="◷"
            />

            <GoalDetail
              label="Weekly availability"
              value={
                careerGoal.weeklyAvailability
                  ? `${careerGoal.weeklyAvailability} hours/week`
                  : 'Not specified'
              }
              icon="↗"
            />

            {((Array.isArray(careerGoal.preferredTechnologies) &&
              careerGoal.preferredTechnologies.length > 0) ||
              (typeof careerGoal.preferredTechnologies === 'string' &&
                careerGoal.preferredTechnologies.length > 0)) && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-sm text-indigo-600">
                    ◆
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Preferred technologies
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(Array.isArray(careerGoal.preferredTechnologies)
                        ? careerGoal.preferredTechnologies
                        : String(careerGoal.preferredTechnologies || '')
                            .split(',')
                      ).map((tech: string) => (
                        <span
                          key={tech}
                          className="rounded-lg border border-indigo-100 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {careerGoal.updatedAt && (
              <p className="text-xs text-slate-400 sm:col-span-2">
                Last updated{' '}
                {new Date(careerGoal.updatedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {!showForm && !careerGoal && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-xl text-indigo-600">
              ◎
            </div>

            <h4 className="mt-5 text-lg font-semibold text-slate-900">
              Your career direction starts here
            </h4>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Set a target role and GAPLY will use it to personalize your
              skills analysis, projects and learning roadmap.
            </p>

            <button
              onClick={() => setShowForm(true)}
              className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Create career goal →
            </button>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
            How GAPLY uses this
          </p>

          <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            Your goal shapes the rest of your workspace.
          </h3>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            One career target connects your skills, projects and roadmap into
            a single learning direction.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            number="01"
            icon="◆"
            title="Skill analysis"
            description="Your target role helps identify the skills you need and the gaps to work on."
          />

          <FeatureCard
            number="02"
            icon="▣"
            title="Project matching"
            description="Projects are selected around the skills that matter for your career direction."
          />

          <FeatureCard
            number="03"
            icon="↗"
            title="Learning roadmap"
            description="Your timeline and availability help shape a practical week-by-week plan."
          />
        </div>
      </section>

      {careerGoal && (
        <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-7 md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                Ready to build?
              </p>

              <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                Turn your goal into a roadmap.
              </h3>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                See the skills and activities you should focus on next.
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
      )}
    </div>
  );
}

const inputClass =
  'block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';

function FormField({
  label,
  hint,
  children,
  className = '',
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-slate-800">
        {label}
      </label>

      <p className="mb-2 mt-1 text-xs text-slate-400">{hint}</p>

      {children}
    </div>
  );
}

function GoalDetail({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight
          ? 'border-indigo-100 bg-indigo-50/50'
          : 'border-slate-100 bg-slate-50/70'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm ${
            highlight
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-indigo-600'
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
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

function LoadingState({ text }: { text: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
        <p className="mt-4 text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}
