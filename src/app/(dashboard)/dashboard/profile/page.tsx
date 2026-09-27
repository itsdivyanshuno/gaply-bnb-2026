'use client';

import { useEffect, useMemo, useState } from 'react';

type Skill = {
  id?: string;
  name: string;
  proficiency: number;
  confidence?: number;
};

type Profile = {
  name: string;
  email: string;
  education: string;
  degreeBranch: string;
  year: number | null;
  weeklyAvailability: number | null;
  skills: Skill[];
};

const defaultProfile: Profile = {
  name: '',
  email: '',
  education: '',
  degreeBranch: '',
  year: null,
  weeklyAvailability: null,
  skills: [],
};

const demoSkills: Skill[] = [
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
];

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [editing, setEditing] = useState(false);
  const [skillsInput, setSkillsInput] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('gaply_user');

    if (!storedUser) {
      setAuthLoading(false);
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);

      const profileKey = `gaply_profile_${userData.id}`;
      const storedProfile = localStorage.getItem(profileKey);

      if (storedProfile) {
        try {
          const parsed = JSON.parse(storedProfile);

          setProfile({
            ...defaultProfile,
            ...parsed,
            skills: Array.isArray(parsed.skills) ? parsed.skills : [],
          });
        } catch {
          setProfile({
            ...defaultProfile,
            name: userData.name || '',
            email: userData.email || '',
            education: 'Computer Science',
            degreeBranch: 'Software Engineering',
            year: 3,
            weeklyAvailability: 10,
            skills: demoSkills,
          });
        }
      } else {
        setProfile({
          ...defaultProfile,
          name: userData.name || '',
          email: userData.email || '',
          education: 'Computer Science',
          degreeBranch: 'Software Engineering',
          year: 3,
          weeklyAvailability: 10,
          skills: demoSkills,
        });
      }
    } catch {
      setUser(null);
    }

    setAuthLoading(false);
  }, []);

  const skills = Array.isArray(profile.skills) ? profile.skills : [];

  const averageProficiency = useMemo(() => {
    if (!skills.length) return 0;

    const total = skills.reduce(
      (sum, skill) => sum + clamp(Number(skill.proficiency) || 0),
      0
    );

    return Math.round(total / skills.length);
  }, [skills]);

  const strongestSkill = useMemo(() => {
    if (!skills.length) return null;

    return [...skills].sort(
      (a, b) =>
        clamp(Number(b.proficiency) || 0) -
        clamp(Number(a.proficiency) || 0)
    )[0];
  }, [skills]);

  const handleSave = () => {
    localStorage.setItem(
      `gaply_profile_${user.id}`,
      JSON.stringify({
        ...profile,
        skills,
      })
    );

    setEditing(false);
    alert('Profile saved successfully!');
  };

  const addSkill = () => {
    const parts = skillsInput.split(':');
    const name = parts[0]?.trim() || '';
    const proficiencyText = parts.slice(1).join(':').trim();
    const parsedProficiency = parseInt(proficiencyText, 10);

    if (
      !name ||
      Number.isNaN(parsedProficiency) ||
      parsedProficiency < 0 ||
      parsedProficiency > 100
    ) {
      return;
    }

    setProfile((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          id: `skill-${Date.now()}-${Math.random()}`,
          name,
          proficiency: parsedProficiency,
          confidence: 0.5,
        },
      ],
    }));

    setSkillsInput('');
  };

  const handleAddSkill = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    addSkill();
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
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl" />

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-black shadow-xl shadow-indigo-950/40">
                {getInitials(profile.name)}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-400">
                  Your profile
                </p>

                <h2 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">
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
              className={`rounded-xl px-5 py-3 text-sm font-bold transition ${
                editing
                  ? 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  : 'bg-white text-slate-950 hover:bg-slate-100'
              }`}
            >
              {editing ? 'Cancel editing' : 'Edit profile'}
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 md:grid-cols-4">
            <HeroStat
              label="Education"
              value={profile.education || 'Not specified'}
            />

            <HeroStat
              label="Branch"
              value={profile.degreeBranch || 'Not specified'}
            />

            <HeroStat
              label="Current year"
              value={profile.year ? `Year ${profile.year}` : 'Not specified'}
            />

            <HeroStat
              label="Learning time"
              value={
                profile.weeklyAvailability
                  ? `${profile.weeklyAvailability} hrs/week`
                  : 'Not specified'
              }
            />
          </div>
        </div>
      </section>

      {editing ? (
        <EditProfile
          profile={profile}
          setProfile={setProfile}
          skills={skills}
          skillsInput={skillsInput}
          setSkillsInput={setSkillsInput}
          handleAddSkill={handleAddSkill}
          handleSave={handleSave}
          setEditing={setEditing}
        />
      ) : (
        <>
          {/* Profile overview */}
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <SectionHeading
                eyebrow="About you"
                title="Personal information"
                description="The details GAPLY uses to understand your starting point."
              />

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
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
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeading
                eyebrow="Capacity"
                title="Learning availability"
              />

              <div className="mt-8 flex items-end gap-2">
                <span className="text-5xl font-black tracking-tight text-slate-950">
                  {profile.weeklyAvailability || '—'}
                </span>

                <span className="pb-2 text-sm font-semibold text-slate-500">
                  hrs / week
                </span>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-600"
                  style={{
                    width: `${Math.min(
                      100,
                      ((profile.weeklyAvailability || 0) / 40) * 100
                    )}%`,
                  }}
                />
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                GAPLY uses this to keep your projects and roadmap realistic.
              </p>
            </div>
          </section>

          {/* Skills */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <SectionHeading
                eyebrow="Skill profile"
                title="Your current skills"
                description="Your self-assessed proficiency across the skills you've added."
              />

              <div className="flex gap-2">
                <MiniStat
                  label="Skills"
                  value={String(skills.length)}
                />

                <MiniStat
                  label="Avg. level"
                  value={`${averageProficiency}%`}
                />
              </div>
            </div>

            {skills.length > 0 ? (
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {skills.map((skill, index) => {
                  const proficiency = clamp(
                    Number(skill.proficiency) || 0
                  );

                  const confidence = clamp(
                    (Number(skill.confidence) || 0) * 100
                  );

                  return (
                    <div
                      key={skill.id || index}
                      className="group rounded-2xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md hover:shadow-slate-100"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-sm font-black text-indigo-600">
                            {getInitials(skill.name)}
                          </div>

                          <div>
                            <h4 className="font-bold text-slate-950">
                              {skill.name || 'Unnamed skill'}
                            </h4>

                            <p className="mt-0.5 text-xs font-medium text-slate-400">
                              {getProficiencyLabel(proficiency)}
                            </p>
                          </div>
                        </div>

                        <span className="text-lg font-black text-indigo-600">
                          {proficiency}%
                        </span>
                      </div>

                      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-indigo-600 transition-all"
                          style={{ width: `${proficiency}%` }}
                        />
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          Confidence
                        </span>

                        <span className="font-bold text-slate-600">
                          {Math.round(confidence)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptySkills onClick={() => setEditing(true)} />
            )}
          </section>

          {/* Summary */}
          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm md:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-400">
                Strongest skill
              </p>

              <h3 className="mt-3 text-2xl font-black">
                {strongestSkill?.name || 'Add your first skill'}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {strongestSkill
                  ? `${clamp(
                      Number(strongestSkill.proficiency) || 0
                    )}% self-assessed proficiency`
                  : 'Your strongest skill will appear here once you add skills.'}
              </p>
            </div>

            <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6 md:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                Why this matters
              </p>

              <h3 className="mt-3 text-xl font-black text-slate-950">
                Better inputs → better guidance.
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your profile gives GAPLY the context it needs to personalize
                skill gaps, projects and your roadmap.
              </p>

              <button
                type="button"
                onClick={() => setEditing(true)}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                Update profile →
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function EditProfile({
  profile,
  setProfile,
  skills,
  skillsInput,
  setSkillsInput,
  handleAddSkill,
  handleSave,
  setEditing,
}: {
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  skills: Skill[];
  skillsInput: string;
  setSkillsInput: React.Dispatch<React.SetStateAction<string>>;
  handleAddSkill: (
    e: React.MouseEvent<HTMLButtonElement>
  ) => void;
  handleSave: () => void;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const addSkillFromInput = () => {
    const parts = skillsInput.split(':');
    const name = parts[0]?.trim() || '';
    const proficiencyText = parts.slice(1).join(':').trim();
    const parsed = parseInt(proficiencyText, 10);

    if (
      !name ||
      Number.isNaN(parsed) ||
      parsed < 0 ||
      parsed > 100
    ) {
      return;
    }

    setProfile((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          id: `skill-${Date.now()}-${Math.random()}`,
          name,
          proficiency: parsed,
          confidence: 0.5,
        },
      ],
    }));

    setSkillsInput('');
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <SectionHeading
        eyebrow="Profile settings"
        title="Update your information"
        description="Keep your profile updated so GAPLY can personalize your roadmap."
      />

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <InputField
          label="Full name"
          value={profile.name}
          placeholder="Your full name"
          onChange={(value) =>
            setProfile((prev) => ({
              ...prev,
              name: value,
            }))
          }
        />

        <InputField
          label="Email"
          type="email"
          value={profile.email}
          placeholder="you@example.com"
          onChange={(value) =>
            setProfile((prev) => ({
              ...prev,
              email: value,
            }))
          }
        />

        <InputField
          label="Education"
          value={profile.education}
          placeholder="e.g. Computer Science"
          onChange={(value) =>
            setProfile((prev) => ({
              ...prev,
              education: value,
            }))
          }
        />

        <InputField
          label="Degree / Branch"
          value={profile.degreeBranch}
          placeholder="e.g. Information Technology"
          onChange={(value) =>
            setProfile((prev) => ({
              ...prev,
              degreeBranch: value,
            }))
          }
        />

        <InputField
          label="Current year"
          type="number"
          value={profile.year ?? ''}
          placeholder="3"
          min={1}
          max={8}
          onChange={(value) =>
            setProfile((prev) => ({
              ...prev,
              year: value ? parseInt(value, 10) : null,
            }))
          }
        />

        <InputField
          label="Weekly availability"
          type="number"
          value={profile.weeklyAvailability ?? ''}
          placeholder="10"
          min={1}
          max={40}
          suffix="hrs/week"
          onChange={(value) =>
            setProfile((prev) => ({
              ...prev,
              weeklyAvailability: value
                ? parseInt(value, 10)
                : null,
            }))
          }
        />
      </div>

      {/* Skills editor */}
      <div className="mt-9 border-t border-slate-100 pt-8">
        <h4 className="text-lg font-black text-slate-950">
          Your skills
        </h4>

        <p className="mt-1 text-sm text-slate-500">
          Add skills using{' '}
          <span className="font-semibold text-slate-700">
            Skill Name: Proficiency
          </span>
          .
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="e.g. TypeScript: 75"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkillFromInput();
              }
            }}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />

          <button
            type="button"
            onClick={handleAddSkill}
            disabled={!skillsInput.trim()}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            + Add skill
          </button>
        </div>

        {skills.length > 0 && (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {skills.map((skill, index) => {
              const proficiency = clamp(
                Number(skill.proficiency) || 0
              );

              return (
                <div
                  key={skill.id || index}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {skill.name}
                    </span>

                    <span className="text-sm font-black text-indigo-600">
                      {proficiency}%
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{
                        width: `${proficiency}%`,
                      }}
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

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={!profile.name}
          className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save changes
        </button>
      </div>
    </section>
  );
}

function InputField({
  label,
  value,
  placeholder,
  type = 'text',
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: string | number;
  placeholder: string;
  type?: string;
  min?: number;
  max?: number;
  suffix?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          type={type}
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 ${
            suffix ? 'pr-20' : ''
          } text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10`}
          placeholder={placeholder}
        />

        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">
        {eyebrow}
      </p>

      <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950 md:text-2xl">
        {title}
      </h3>

      {description && (
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

function HeroStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-bold text-slate-200">
        {value}
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-2.5 text-right">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 text-sm font-black text-slate-900">
        {value}
      </p>
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
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function EmptySkills({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
        ◆
      </div>

      <h4 className="mt-4 font-black text-slate-900">
        No skills added yet
      </h4>

      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        Add your current skills and proficiency levels so GAPLY can understand
        your starting point.
      </p>

      <button
        type="button"
        onClick={onClick}
        className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
      >
        Add your skills
      </button>
    </div>
  );
}

function clamp(value: number) {
  return Math.min(100, Math.max(0, value));
}

function getProficiencyLabel(value: number) {
  if (value >= 80) return 'Advanced';
  if (value >= 60) return 'Strong';
  if (value >= 40) return 'Intermediate';
  if (value >= 20) return 'Developing';
  return 'Beginner';
}