'use client';
"use client";
import Link from 'next/link';
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
    // Load user data from localStorage
    const storedUser = localStorage.getItem('gaply_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
    setAuthLoading(false);

    // Load profile data (in a real app, this would come from an API)
    // For demo, we'll use mock data or empty values
    const storedProfile = localStorage.getItem('gaply_profile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    } else {
      // Set default values if user exists
      if (user) {
        setProfile({
          name: user.name,
          email: user.email,
          education: 'Computer Science',
          degreeBranch: 'Software Engineering',
          year: 3,
          weeklyAvailability: 10,
          skills: [
            { id: 'skill-1', name: 'JavaScript', proficiency: 75, confidence: 0.8 },
            { id: 'skill-2', name: 'React', proficiency: 65, confidence: 0.75 },
            { id: 'skill-3', name: 'Node.js', proficiency: 40, confidence: 0.7 },
            { id: 'skill-4', name: 'PostgreSQL', proficiency: 25, confidence: 0.65 },
            { id: 'skill-5', name: 'Testing', proficiency: 15, confidence: 0.6 },
            { id: 'skill-6', name: 'System Design', proficiency: 10, confidence: 0.55 },
          ]
        });
      }
    }
  }, [user]);

  const handleSave = () => {
    localStorage.setItem('gaply_profile', JSON.stringify(profile));
    setEditing(false);
    alert('Profile saved successfully!');
  };

  const handleSkillChange = (e: any) => {
    setSkillsInput(e.target.value);
  };

  const handleAddSkill = () => {
    if (skillsInput.trim()) {
      const [name, proficiency] = skillsInput.split(':').map(s => s.trim());
      if (name && proficiency && !isNaN(parseInt(proficiency))) {
        setProfile((prev: any) => ({
          ...prev,
          skills: [
            ...prev.skills,
            {
              id: `skill-${Date.now()}-${Math.random()}`,
              name,
              proficiency: parseInt(proficiency),
              confidence: 0.5 // Default confidence for new skills
            }
          ]
        }));
        setSkillsInput('');
      }
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-3 text-sm text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to sign in if not authenticated
    window.location.href = '/signin';
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {profile.name || 'Your Profile'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {profile.email || 'No email provided'}
            </p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className={editing ?
              'text-indigo-600 hover:text-indigo-500' :
              'text-gray-500 hover:text-gray-600'}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {editing ? (
          <form className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                required
                value={profile.name || ''}
                onChange={(e: any) => setProfile((prev: any) => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                value={profile.email || ''}
                onChange={(e: any) => setProfile((prev: any) => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Education
              </label>
              <input
                type="text"
                value={profile.education || ''}
                onChange={(e: any) => setProfile((prev: any) => ({ ...prev, education: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Degree/Branch
              </label>
              <input
                type="text"
                value={profile.degreeBranch || ''}
                onChange={(e: any) => setProfile((prev: any) => ({ ...prev, degreeBranch: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Year
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={profile.year || ''}
                  onChange={(e: any) => setProfile((prev: any) => ({ ...prev, year: e.target.value ? parseInt(e.target.value) : null }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Weekly Availability (hrs)
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={profile.weeklyAvailability || ''}
                  onChange={(e: any) => setProfile((prev: any) => ({ ...prev, weeklyAvailability: e.target.value ? parseInt(e.target.value) : null }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Skills (format: "Skill Name: Proficiency")
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="e.g., JavaScript: 85"
                  value={skillsInput}
                  onChange={handleSkillChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  onClick={handleAddSkill}
                  className="mt-2 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  disabled={!skillsInput.trim()}
                >
                  Add Skill
                </button>
              </div>
              {profile.skills.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-600">Your Skills:</h4>
                  <div className="mt-2 space-y-1">
                    {profile.skills.map((skill: any, index: number) => (
                      <div key={index} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-sm text-gray-600">
                          {skill.proficiency}% (confidence: {Math.round(skill.confidence * 100)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <p className="text-sm text-gray-600">
                {profile.education || 'Not specified'} •
                {profile.degreeBranch || 'Not specified'} •
                Year {profile.year || 'Not specified'}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Availability</h3>
              <p className="text-sm text-gray-600">
                {profile.weeklyAvailability || 'Not specified'} hours/week available for learning
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Skills Overview</h3>
              {profile.skills.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {profile.skills.map((skill: any) => (
                    <div key={skill.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md">
                      <div className="flex-1">
                        <span className="font-medium">{skill.name}</span>
                        <p className="text-xs text-gray-500 mt-1">
                          Proficiency: {skill.proficiency}% • Confidence: {Math.round(skill.confidence * 100)}%
                        </p>
                      </div>
                      <div className="w-20 text-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${skill.proficiency}%` }}></div>
                        </div>
                        <p className="mt-1 text-xs text-indigo-600 font-medium">{skill.proficiency}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">
                  No skills added yet. Add your skills in edit mode.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={handleSave}
            className="w-full justify-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            disabled={editing && !profile.name}
          >
            {editing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}