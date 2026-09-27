'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    skillsAssessed: 0,
    skillsWithDeficit: 0,
    overallReadiness: 0,
    projectsCompleted: 0,
  });
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

    // Load stats (in a real app, this would come from an API)
    // For demo, we'll use mock data
    setStats({
      skillsAssessed: 8,
      skillsWithDeficit: 5,
      overallReadiness: 62,
      projectsCompleted: 3,
    });
  }, []);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Skills Assessed</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.skillsAssessed}</p>
          <p className="text-xs text-gray-500">out of 12 core skills</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Skills to Improve</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.skillsWithDeficit}</p>
          <p className="text-xs text-gray-500">need attention</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Overall Readiness</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.overallReadiness}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${stats.overallReadiness}%` }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">towards your goal</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Projects Completed</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.projectsCompleted}</p>
          <p className="text-xs text-gray-500">hands-on experience</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/dashboard/profile"
              className="flex w-full items-center px-4 py-3 bg-gray-50 rounded-lg hover:bg-indigo-50"
            >
              <span className="mr-3 text-indigo-600">👤</span>
              <span>Update Profile</span>
            </Link>
            <Link
              href="/dashboard/skills"
              className="flex w-full items-center px-4 py-3 bg-gray-50 rounded-lg hover:bg-indigo-50"
            >
              <span className="mr-3 text-indigo-600">📊</span>
              <span>Analyze Skill Gaps</span>
            </Link>
            <Link
              href="/dashboard/projects"
              className="flex w-full items-center px-4 py-3 bg-gray-50 rounded-lg hover:bg-indigo-50"
            >
              <span className="mr-3 text-indigo-600">💡</span>
              <span>Get Project Recommendations</span>
            </Link>
            <Link
              href="/dashboard/roadmap"
              className="flex w-full items-center px-4 py-3 bg-gray-50 rounded-lg hover:bg-indigo-50"
            >
              <span className="mr-3 text-indigo-600">🗺️</span>
              <span>View Learning Roadmap</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Completed JavaScript Basics</h4>
                <p className="text-sm text-gray-500">2 hours ago • +5 pts to JavaScript</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12h6m-6 4h6m2-5a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Started Node.js Module</h4>
                <p className="text-sm text-gray-500">Yesterday • Enrolled in course</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"></path>
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Updated Profile</h4>
                <p className="text-sm text-gray-500">Today • Added education details</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
