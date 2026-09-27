'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CareerGoalPage() {
  const [user, setUser] = useState<any>(null);
  const [careerGoal, setCareerGoal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    targetRole: '',
    experienceLevel: '' as 'Beginner' | 'Intermediate' | 'Advanced' | '',
    timelineMonths: '',
    preferredTechnologies: '',
    weeklyAvailability: ''
  });
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('gaply_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      loadCareerGoal(JSON.parse(storedUser).id);
    } else {
      setUser(null);
    }
    setAuthLoading(false);

    // Handle storage events for multi-tab sync
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
          setFormData({
            targetRole: '',
            experienceLevel: '' as 'Beginner' | 'Intermediate' | 'Advanced' | '',
            timelineMonths: '',
            preferredTechnologies: '',
            weeklyAvailability: ''
          });
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
          timelineMonths:
            existingGoal.timelineMonths?.toString() || '',
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
    // Reset form to current career goal values or empty
    if (careerGoal) {
      setFormData({
        targetRole: careerGoal.targetRole,
        experienceLevel: careerGoal.experienceLevel || '',
        timelineMonths: careerGoal.timelineMonths?.toString() || '',
        preferredTechnologies: Array.isArray(careerGoal.preferredTechnologies)
          ? careerGoal.preferredTechnologies.join(', ')
          : String(careerGoal.preferredTechnologies || ''),
        weeklyAvailability: careerGoal.weeklyAvailability?.toString() || ''
      });
    } else {
      setFormData({
        targetRole: '',
        experienceLevel: '' as 'Beginner' | 'Intermediate' | 'Advanced' | '',
        timelineMonths: '',
        preferredTechnologies: '',
        weeklyAvailability: ''
      });
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

  // Redirect to sign in if not authenticated (after we've finished checking)
  if (!user) {
    window.location.href = '/signin';
    return null;
  }

  if (loading && !careerGoal) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-3 text-sm text-gray-500">Loading your career goal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Career Goal Management
            </h2>
            <p className="text-sm text-gray-500">
              Define your target role and learning objectives to get personalized recommendations
            </p>
          </div>
          <div className="flex space-x-3">
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-ring-offset-2"
              >
                {careerGoal ? 'Update Goal' : 'Set Career Goal'}
              </button>
            )}
            {showForm && (
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Target Role
              </label>
              <input
                type="text"
                id="target-role"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., Full Stack Developer"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Experience Level
              </label>
              <select
                id="experience-level"
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as any })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select experience level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Timeline (months)
              </label>
              <input
                type="number"
                id="timeline-months"
                value={formData.timelineMonths}
                onChange={(e) => setFormData({ ...formData, timelineMonths: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                min="1"
                placeholder="e.g., 6"
              />
              <p className="mt-1 text-sm text-gray-500">
                How many months do you plan to achieve this goal?
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Preferred Technologies (comma-separated)
              </label>
              <input
                type="text"
                id="preferred-technologies"
                value={formData.preferredTechnologies}
                onChange={(e) => setFormData({ ...formData, preferredTechnologies: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., JavaScript, React, Node.js, PostgreSQL"
              />
              <p className="mt-1 text-sm text-gray-500">
                List technologies you want to focus on, separated by commas
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Weekly Availability (hours)
              </label>
              <input
                type="number"
                id="weekly-availability"
                value={formData.weeklyAvailability}
                onChange={(e) => setFormData({ ...formData, weeklyAvailability: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                min="1"
                max="168"
                placeholder="e.g., 10"
              />
              <p className="mt-1 text-sm text-gray-500">
                How many hours per week can you dedicate to learning?
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-ring-offset-2"
              >
                {loading ? 'Saving...' : 'Save Goal'}
              </button>
            </div>
          </form>
        )}

        {!showForm && careerGoal && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                Your Career Goal
              </h3>
              <p className="text-sm text-gray-500">
                Last updated: {new Date(careerGoal.updatedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Target Role:</h4>
                <p className="text-sm">{careerGoal.targetRole}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Experience Level:</h4>
                <p className="text-sm capitalize">{careerGoal.experienceLevel || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Timeline:</h4>
                <p className="text-sm">
                  {careerGoal.timelineMonths ? `${careerGoal.timelineMonths} months` : 'Not specified'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Weekly Availability:</h4>
                <p className="text-sm">
                  {careerGoal.weeklyAvailability ? `${careerGoal.weeklyAvailability} hours/week` : 'Not specified'}
                </p>
              </div>
            </div>

            {careerGoal.preferredTechnologies.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Preferred Technologies:</h4>
                <p className="text-sm">{Array.isArray(careerGoal.preferredTechnologies)
                  ? careerGoal.preferredTechnologies.join(', ')
                  : String(careerGoal.preferredTechnologies || '')}</p>
              </div>
            )}
          </div>
        )}

        {!showForm && !careerGoal && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              You haven't set a career goal yet. Define your target role to get personalized learning recommendations.
            </p>
            <Link
              href="/dashboard/career-goal"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-ring-offset-2"
              onClick={() => setShowForm(true)}
            >
              Set Your Career Goal
            </Link>
          </div>
        )}
      </div>

      {/* How it works section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          How Career Goals Work
        </h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"></path>
                </svg>
              </div>
            </div>
            <div>
              <h4 className="font-medium">Personalized Learning Path</h4>
              <p className="text-sm text-gray-500">
                Your career goal drives personalized skill gap analysis and project recommendations
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m5 6V9a3 3 0 00-5.9-1.4l.8-.1.2-.2a1 1 0 00-1.2-.8l-.5-.2a1 1 0 00-1-1V7a3 3 0 00-5.6-.4l-.3-.1a1 1 0 00-1.1 0l-.3.1a1 1 0 00-.8.5l-.2.2V10a1 1 0 011 1h1"></path>
                </svg>
              </div>
            </div>
            <div>
              <h4 className="font-medium">Skill-Based Recommendations</h4>
              <p className="text-sm text-gray-500">
                We identify the skills you need to develop and recommend projects to build them
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
            <div>
              <h4 className="font-medium">Progress Tracking</h4>
              <p className="text-sm text-gray-500">
                Track your progress toward your goal with milestones and evidence of learning
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to action */}
      {careerGoal && (
        <div className="mt-6">
          <Link
            href="/dashboard/roadmap"
            className="w-full inline-flex justify-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-ring-offset-2"
          >
            View Your Personalized Roadmap
          </Link>
        </div>
      )}
    </div>
  );
}