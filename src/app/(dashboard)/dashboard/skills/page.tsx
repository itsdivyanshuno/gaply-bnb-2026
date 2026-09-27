'use client';
"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SkillsPage() {
  const [user, setUser] = useState<any>(null);
  const [gapAnalysis, setGapAnalysis] = useState<any>({ targetRole: "", overallReadiness: 0, skillGaps: [], prioritySkills: [] });
  const [prioritizedSkills, setPrioritizedSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadSkills = async () => {
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
          `/api/skills?studentId=${encodeURIComponent(userData.id)}`
        );

        if (!response.ok) {
          throw new Error('Failed to load skills');
        }

        const data = await response.json();

        setGapAnalysis(data.analysis);
        setPrioritizedSkills(data.priorities);
      } catch (err) {
        console.error('Failed to load skills:', err);
        setError('Failed to load skill analysis.');
      } finally {
        setLoading(false);
      }
    };

    loadSkills();
  }, []);


  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Skill Gap Analysis for {gapAnalysis.targetRole}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Overall readiness: <span className="font-medium">{gapAnalysis.overallReadiness}%</span>
        </p>

        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${gapAnalysis.overallReadiness}%` }}></div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Your Skill Gaps
          </h3>
          <div className="space-y-3">
            {gapAnalysis.skillGaps.map((gap: any) => {
              const gapAbs = Math.abs(gap.gap);
              const gapClass = gap.gap >= 0
                ? 'bg-green-50 text-green-800'
                : gapAbs <= 15
                  ? 'bg-yellow-50 text-yellow-800'
                  : gapAbs <= 30
                    ? 'bg-orange-50 text-orange-800'
                    : 'bg-red-50 text-red-800';

              return (
                <div key={gap.skillId} className={`p-4 rounded-lg ${gapClass} border-l-4 ${gap.gap >= 0 ? 'border-green-500' : gapAbs <= 15 ? 'border-yellow-500' : gapAbs <= 30 ? 'border-orange-500' : 'border-red-500'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{gap.skillName}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${gapClass}`}>
                      {gap.gap >= 0 ? '(Surplus)' : `(Gap: ${Math.abs(gap.gap)}pts)`}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Current Proficiency:</span>
                      <span className="text-sm">{gap.currentProficiency}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Required Proficiency:</span>
                      <span className="text-sm">{gap.requiredProficiency}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Gap:</span>
                      <span className="text-sm font-medium">
                        {gap.gap >= 0 ? `+${gap.gap}` : `${gap.gap}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Confidence:</span>
                      <span className="text-sm">
                        {Math.round(gap.confidence * 100)}%
                        {gap.confidence < 0.6 ? '(Low)' : gap.confidence < 0.8 ? '(Medium)' : '(High)'}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {gap.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {gapAnalysis.prioritySkills.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Recommended Learning Priority
            </h3>
            <ol className="list-decimal list-inside space-y-2">
              {gapAnalysis.prioritySkills.map((skillId: any, index: number) => {
                const skill = gapAnalysis.skillGaps.find((g: any) => g.skillId === skillId);
                if (!skill) return null;

                return (
                  <li key={skillId} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <span className="text-indigo-600">{index + 1}.</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{skill.skillName}</h4>
                      <p className="text-sm text-gray-600">
                        Priority score based on gap size, role importance, project relevance, dependency score, and learning efficiency.
                      </p>
                      <p className="mt-1 text-xs text-indigo-600">
                        Gap: {skill.gap < 0 ? `${Math.abs(skill.gap)}pts` : `+${skill.gap}pts surplus`}
                      </p>
                    </div>
                  </li>
                );
              }).filter(Boolean)}
            </ol>
          </div>
        )}

        <div className="mt-6">
          <Link
            href="/dashboard/projects"
            className="w-full inline-flex justify-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-ring-offset-2"
          >
            View Project Recommendations
          </Link>
        </div>
      </div>
    </div>
  );
}