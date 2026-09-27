'use client';

import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({
    name: '',
    email: '',
    education: '',
    degreeBranch: '',
    year: null,
    weeklyAvailability: null,
    skills: [],
  });
  const [editing, setEditing] = useState(false);
  const [skillsInput, setSkillsInput] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('gaply_user');

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }

    setAuthLoading(false);

    const storedProfile = localStorage.getItem('gaply_profile');

    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile);

        setProfile({
          ...parsedProfile,
          skills: Array.isArray(parsedProfile.skills)
            ? parsedProfile.skills
            : [],
        });
      } catch {
        // Keep defaults
      }
    } else if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);

        setProfile({
          name: userData.name || '',
          email: userData.email || '',
          education: 'Computer Science',
          degreeBranch: 'Software Engineering',
          year: 3,
          weeklyAvailability: 10,
          skills: [
            {
              id: 'skill-1',
              name: 'JavaScript',
              proficiency: 75,
              confidence: 0.8,
            },
            {
              id: 'skill-2',
              name: 'React',
              proficiency: 65,
              confidence: 0.75,
            },
            {
              id: 'skill-3',
              name: 'Node.js',
              proficiency: 40,
              confidence: 0.7,
            },
            {
              id: 'skill-4',
              name: 'PostgreSQL',
              proficiency: 25,
              confidence: 0.65,
            },
            {
              id: 'skill-5',
              name: 'Testing',
              proficiency: 15,
              confidence: 0.6,
            },
            {
              id: 'skill-6',
              name: 'System Design',
              proficiency: 10,
              confidence: 0.55,
            },
          ],
        });
      } catch {
        // Keep defaults
      }
    }
  }, []);

  const skills = Array.isArray(profile.skills) ? profile.skills : [];

  const handleSave = () => {
    localStorage.setItem(
      'gaply_profile',
      JSON.stringify({
        ...profile,
        skills,
      })
    );

    setEditing(false);
    alert('Profile saved successfully!');
  };

  const handleAddSkill = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!skillsInput.trim()) return;

    const [name, proficiency] = skillsInput
      .split(':')
      .map((value) => value.trim());

    const parsedProficiency = parseInt(proficiency, 10);

    if (
      name &&
      !isNaN(parsedProficiency) &&
      parsedProficiency >= 0 &&
      parsedProficiency <= 100
    ) {
      setProfile((prev: any) => ({
        ...prev,
        skills: [
          ...(Array.isArray(prev.skills) ? prev.skills : []),
          {
            id: `skill-${Date.now()}-${Math.random()}`,
            name,
            proficiency: parsedProficiency,
            confidence: 0.5,
          },
        ],
      }));

      setSkillsInput('');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'G';

    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  const getProficiencyLabel = (value: number) => {
    if (value >= 80) return 'Advanced';
    if (value >= 60) return 'Strong';
    if (value >= 40) return 'Intermediate';
    if (value >= 20) return 'Developing';
    return 'Beginner';
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <p className="mt-4 text-sm text-slate-500">
            Loading your profile...
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

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-sm md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold shadow-lg shadow-indigo-950/40">
              {getInitials(profile.name)}
            </div>

            <div>
              <p className="text-sm font-medium text-indigo-300">
                Your profile
              </p>

              <h2 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
                {profile.name || 'Complete your profile'}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                {profile.email || 'Add your email address'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
              editing
                ? 'border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
                : 'bg-white text-slate-950 hover:bg-slate-100'
            }`}
          >
            {editing ? 'Cancel editing' : 'Edit profile'}
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 md:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Education
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-200">
              {profile.education || 'Not specified'}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Branch
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-200">
              {profile.degreeBranch || 'Not specified'}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Year
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-200">
              {profile.year ? `Year ${profile.year}` : 'Not specified'}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Learning time
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-200">
              {profile.weeklyAvailability
                ? `${profile.weeklyAvailability} hrs/week`
                : 'Not specified'}
            </p>
          </div>
        </div>
      </section>

      {editing ? (
        /* EDIT MODE */
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              Profile settings
            </p>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Update your information
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Keep your profile updated so GAPLY can personalize your roadmap.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                required
                value={profile.name || ''}
                onChange={(e) =>
                  setProfile((prev: any) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                type="email"
                required
                value={profile.email || ''}
                onChange={(e) =>
                  setProfile((prev: any) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Education
              </label>
              <input
                type="text"
                value={profile.education || ''}
                onChange={(e) =>
                  setProfile((prev: any) => ({
                    ...prev,
                    education: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                placeholder="e.g. Computer Science"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Degree / Branch
              </label>
              <input
                type="text"
                value={profile.degreeBranch || ''}
                onChange={(e) =>
                  setProfile((prev: any) => ({
                    ...prev,
                    degreeBranch: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                placeholder="e.g. Information Technology"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Current Year
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={profile.year || ''}
                onChange={(e) =>
                  setProfile((prev: any) => ({
                    ...prev,
                    year: e.target.value
                      ? parseInt(e.target.value, 10)
                      : null,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                placeholder="3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Weekly Availability
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={profile.weeklyAvailability || ''}
                  onChange={(e) =>
                    setProfile((prev: any) => ({
                      ...prev,
                      weeklyAvailability: e.target.value
                        ? parseInt(e.target.value, 10)
                        : null,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-16 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="10"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  hrs/week
                </span>
              </div>
            </div>
          </div>

          {/* Skills editor */}
          <div className="mt-8 border-t border-slate-100 pt-8">
            <div className="mb-4">
              <h4 className="text-lg font-bold text-slate-950">
                Your skills
              </h4>
              <p className="mt-1 text-sm text-slate-500">
                Add skills using the format{' '}
                <span className="font-medium text-slate-700">
                  Skill Name: Proficiency
                </span>
                .
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="e.g. TypeScript: 75"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();

                    if (skillsInput.trim()) {
                      const [name, proficiency] = skillsInput
                        .split(':')
                        .map((value) => value.trim());

                      const parsedProficiency = parseInt(proficiency, 10);

                      if (
                        name &&
                        !isNaN(parsedProficiency) &&
                        parsedProficiency >= 0 &&
                        parsedProficiency <= 100
                      ) {
                        setProfile((prev: any) => ({
                          ...prev,
                          skills: [
                            ...(Array.isArray(prev.skills)
                              ? prev.skills
                              : []),
                            {
                              id: `skill-${Date.now()}-${Math.random()}`,
                              name,
                              proficiency: parsedProficiency,
                              confidence: 0.5,
                            },
                          ],
                        }));

                        setSkillsInput('');
                      }
                    }
                  }
                }}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />

              <button
                type="button"
                onClick={handleAddSkill}
                disabled={!skillsInput.trim()}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                + Add skill
              </button>
            </div>

            {skills.length > 0 && (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {skills.map((skill: any, index: number) => {
                  const proficiency = Math.min(
                    100,
                    Math.max(0, Number(skill.proficiency) || 0)
                  );

                  return (
                    <div
                      key={skill.id || index}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">
                          {skill.name}
                        </span>
                        <span className="text-sm font-bold text-indigo-600">
                          {proficiency}%
                        </span>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-indigo-600 transition-all"
                          style={{ width: `${proficiency}%` }}
                        />
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        {getProficiencyLabel(proficiency)} · Confidence{' '}
                        {Math.round(
                          (Number(skill.confidence) || 0) * 100
                        )}
                        %
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!profile.name}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save changes
            </button>
          </div>
        </section>
      ) : (
        /* VIEW MODE */
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Personal info */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                    About you
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-slate-950">
                    Personal information
                  </h3>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  ◉
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <InfoItem
                  label="Full name"
                  value={profile.name || 'Not specified'}
                />
                <InfoItem
                  label="Email"
                  value={profile.email || 'Not specified'}
                />
                <InfoItem
                  label="Education"
                  value={profile.education || 'Not specified'}
                />
                <InfoItem
                  label="Degree / Branch"
                  value={profile.degreeBranch || 'Not specified'}
                />
              </div>
            </section>

            {/* Availability */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                Capacity
              </p>

              <h3 className="mt-1 text-xl font-bold text-slate-950">
                Learning availability
              </h3>

              <div className="mt-8 flex items-end gap-2">
                <span className="text-5xl font-black tracking-tight text-slate-950">
                  {profile.weeklyAvailability || '—'}
                </span>

                <span className="pb-2 text-sm font-medium text-slate-500">
                  hrs / week
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                This helps GAPLY estimate realistic project and roadmap
                timelines.
              </p>
            </section>
          </div>

          {/* Skills */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                  Skill profile
                </p>
                <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  Your current skills
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Your self-assessed proficiency across the skills you have
                  added.
                </p>
              </div>

              <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {skills.length} {skills.length === 1 ? 'skill' : 'skills'}
              </div>
            </div>

            {skills.length > 0 ? (
              <div className="mt-7 grid gap-4 md:grid-cols-2">
                {skills.map((skill: any, index: number) => {
                  const proficiency = Math.min(
                    100,
                    Math.max(0, Number(skill.proficiency) || 0)
                  );

                  const confidence = Math.min(
                    100,
                    Math.max(0, (Number(skill.confidence) || 0) * 100)
                  );

                  return (
                    <div
                      key={skill.id || index}
                      className="rounded-2xl border border-slate-200 p-5 transition hover:border-indigo-200 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-slate-950">
                            {skill.name || 'Unnamed skill'}
                          </h4>
                          <p className="mt-1 text-xs font-medium text-slate-400">
                            {getProficiencyLabel(proficiency)}
                          </p>
                        </div>

                        <span className="text-xl font-black text-indigo-600">
                          {proficiency}%
                        </span>
                      </div>

                      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-indigo-600"
                          style={{ width: `${proficiency}%` }}
                        />
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          Confidence
                        </span>
                        <span className="font-semibold text-slate-600">
                          {Math.round(confidence)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                  ◆
                </div>
                <h4 className="mt-4 font-bold text-slate-900">
                  No skills added yet
                </h4>
                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                  Add your current skills and proficiency levels so GAPLY can
                  understand your starting point.
                </p>

                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Add your skills
                </button>
              </div>
            )}
          </section>

          {/* Bottom CTA */}
          <section className="rounded-3xl bg-indigo-50 p-6 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold text-indigo-700">
                  Keep your profile current
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-950">
                  Better inputs → better career guidance.
                </h3>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                  Your profile gives GAPLY the context it needs to personalize
                  skill gaps, projects and your roadmap.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditing(true)}
                className="shrink-0 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Update profile
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}
