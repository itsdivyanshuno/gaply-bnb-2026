import { NextRequest, NextResponse } from 'next/server';
import { roadmapService } from '@/lib/services/roadmapService';
import { skillGapService } from '@/lib/services/skillGapService';

export async function GET(request: NextRequest) {
  try {
    const studentId = request.nextUrl.searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }

    const analysis = await skillGapService.analyzeSkillGaps(studentId);

    const roadmap = await roadmapService.generateRoadmap(studentId, {
      weeklyAvailability: 10,
      timelineMonths: 6,
      includeProjects: true,
    });

    return NextResponse.json({
      analysis,
      roadmap,
    });
  } catch (error) {
    console.error('GET /api/roadmap error:', error);

    return NextResponse.json(
      { error: 'Failed to generate roadmap' },
      { status: 500 }
    );
  }
}
