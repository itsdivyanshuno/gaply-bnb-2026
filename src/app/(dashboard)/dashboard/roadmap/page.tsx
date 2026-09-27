'use client';
"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function RoadmapPage() {
  const [user, setUser] = useState<any>(null);
  const [roadmapData, setRoadmapData] = useState<any>({ totalEstimatedHours: 0, weeklySchedule: [] });
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const loadRoadmap = async () => {
      const storedUser = localStorage.getItem('gaply_user');

      if (!storedUser) {
        window.location.href = '/signin';
        return;
      }

      const userData = JSON.parse(storedUser);
      setUser(userData);

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/roadmap?studentId=${encodeURIComponent(userData.id)}`
        );

        if (!response.ok) {
          throw new Error('Failed to load roadmap');
        }

        const data = await response.json();

        setGapAnalysis(data.analysis);
        setRoadmapData(data.roadmap);
      } catch (err) {
        console.error('Failed to load roadmap:', err);
        setError('Failed to load your personalized roadmap.');
      } finally {
        setLoading(false);
      }
    };

    loadRoadmap();
  }, []);


  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Your Personalized Learning Roadmap
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Week-by-week plan to reach your goal
        </p>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-900">
              Roadmap Overview
            </h3>
            <button
              onClick={() => setShowAdjustments(!showAdjustments)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              {showAdjustments ? 'Hide Adjustments' : 'See Adjustment Suggestions'}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Total Duration:</h4>
              <p className="text-sm">
                ~{Math.ceil(roadmapData.totalEstimatedHours / 10)} weeks
                ({roadmapData.totalEstimatedHours} hours)
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Weekly Commitment:</h4>
              <p className="text-sm">
                10 hours/week (based on your profile)
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Current Readiness:</h4>
              <p className="text-sm">
                {gapAnalysis?.overallReadiness || 0}%
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Target Readiness:</h4>
              <p className="text-sm">
                100%
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Week
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Activities
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                  Hours
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roadmapData.weeklySchedule.map((week: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      Week {week.week}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {week.activities.map((activity: any, idx: number) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <div className="flex-shrink-0">
                            <div className="h-6 w-6 rounded-lg bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">
                              •
                            </div>
                          </div>
                          <div className="flex-1">
                            <span className="text-sm">{activity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {week.hours} hrs
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {week.activities.length} activities
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAdjustments && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Roadmap Adjustment Suggestions
            </h3>
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-medium text-indigo-800 mb-2">
                  Based on your progress, consider these adjustments
                </h4>
                <p className="text-sm text-gray-600">
                  These suggestions are generated based on your recent learning activities and skill development
                </p>
              </div>

              <div className="space-y-3">
                <p className="font-medium text-gray-700 mb-2">
                  Consider adding more focus on:
                </p>
                <ul className="list-disc list-inside pl-5">
                  <li className="mb-1">Advanced Node.js concepts (streams, clustering)</li>
                  <li className="mb-1">Database optimization and indexing</li>
                  <li className="mb-1">System design patterns for scalability</li>
                  <li className="mb-1">Testing strategies and frameworks</li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="font-medium text-gray-700 mb-2">
                  Consider adjusting timeline for:
                </p>
                <ul className="list-disc list-inside pl-5">
                  <li className="mb-1">React advanced topics (hooks, context, performance)</li>
                  <li className="mb-1">Full-stack integration projects</li>
                  <li className="mb-1">Deployment and DevOps fundamentals</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Link
            href="/dashboard/profile"
            className="w-full inline-flex justify-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-ring-offset-2"
          >
            Update Profile & Skills
          </Link>
        </div>
      </div>
    </div>
  );
}