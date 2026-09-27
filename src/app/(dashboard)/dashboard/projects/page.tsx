'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ProjectsPage() {
  const [user, setUser] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
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
          `/api/projects?studentId=${encodeURIComponent(userData.id)}`
        );

        if (!response.ok) {
          throw new Error('Failed to load projects');
        }

        const data = await response.json();

        setGapAnalysis(data.analysis);
        setRecommendations(data.recommendations);
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError('Failed to load project recommendations.');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);


  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Project Recommendations for You
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          These projects are selected to address your skill gaps efficiently
        </p>

        <div className="space-y-4">
          {recommendations.map((project, index) => (
            <div key={project.projectId} className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-medium text-gray-900">
                  {project.projectName}
                </h3>
                <span className="px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                  {Math.round(project.coverageScore)}% Match
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                {project.projectDescription}
              </p>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Skills Addressed ({project.addressedSkills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.addressedSkills.map((skill: any) => (
                    <span key={skill.skillId} className="px-2 py-1 text-xs bg-indigo-50 text-indigo-800 rounded">
                      {skill.skillName}
                    </span>
                  ))}
                </div>
              </div>

              {project.missingSkills.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Still Needs Work ({project.missingSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.missingSkills.map((skill: any) => (
                      <span key={skill.skillId} className="px-2 py-1 text-xs bg-red-50 text-red-800 rounded">
                        {skill.skillName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span>Estimated Effort:</span>
                  <span className="font-medium">{project.estimatedHours} hours</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Difficulty:</span>
                  <span className="font-medium capitalize">{project.difficulty}</span>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-600">
                Explanation
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            How Recommendations Work
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
                <h4 className="font-medium">Personalized Matching</h4>
                <p className="text-sm text-gray-500">
                  Each project is evaluated based on how well it addresses your specific skill gaps
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
                <h4 className="font-medium">Skill Coverage Analysis</h4>
                <p className="text-sm text-gray-500">
                  We calculate how much each project improves your proficiency in each skill area
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Readiness Impact</h4>
                <p className="text-sm text-gray-500">
                  See how each project improves your overall career readiness percentage
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/dashboard/roadmap"
            className="w-full inline-flex justify-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-ring-offset-2"
          >
            View Your Personalized Roadmap
          </Link>
        </div>
      </div>
    </div>
  );
}