'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            GAPLY
          </h1>
          <p className="text-xl text-gray-600">
            Bridging the gap between where you are and where you want to be.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">
              How GAPLY Works
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-left text-gray-700">
              <li>
                <span className="font-medium">Create Your Profile</span> - Add your skills, education, experience, and goals
              </li>
              <li>
                <span className="font-medium">Set Your Career Goal</span> - Choose your target role and timeline
              </li>
              <li>
                <span className="font-medium">Get Your Skill Gap Analysis</span> - See exactly what you're missing and why it matters
              </li>
              <li>
                <span className="font-medium">Get Prioritized Recommendations</span> - Learn what to study first and what projects to build
              </li>
              <li>
                <span className="font-medium">Follow Your Personalized Roadmap</span> - Week-by-week learning plan that adapts as you progress
              </li>
            </ol>
          </div>

          <div className="space-y-4">
            <Link
              href="/signin"
              className="group w-full inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              Get Started
            </Link>

            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-10 text-sm text-gray-500">
          Built for Bit N Build '26 Hackathon • Problem Statement: PS 05 — Education & Employability
        </div>
      </div>
    </div>
  );
}