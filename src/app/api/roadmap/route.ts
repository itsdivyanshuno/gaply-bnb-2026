import { NextRequest, NextResponse } from 'next/server';
import { roadmapService } from '@/lib/services/roadmapService';
import { skillGapService } from '@/lib/services/skillGapService';
import { getCareerGoalRepository } from '@/lib/data/store';

export async function GET(request: NextRequest) {
  try {
    const studentId = request.nextUrl.searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }

    const careerGoalRepo = getCareerGoalRepository();

    const careerGoal = await careerGoalRepo.findUnique({
      where: { studentId },
    });

    if (!careerGoal) {
      return NextResponse.json({
        analysis: null,
        roadmap: null,
        needsSetup: true,
      });
    }

    if (
      careerGoal.timelineMonths == null ||
      careerGoal.weeklyAvailability == null
    ) {
      return NextResponse.json({
        analysis: null,
        roadmap: null,
        needsSetup: true,
        missingFields: {
          timelineMonths: careerGoal.timelineMonths == null,
          weeklyAvailability: careerGoal.weeklyAvailability == null,
        },
      });
    }

    const analysis = await skillGapService.analyzeSkillGaps(studentId);

    const roadmap = await roadmapService.generateRoadmap(studentId, {
      weeklyAvailability: careerGoal.weeklyAvailability,
      timelineMonths: careerGoal.timelineMonths,
      includeProjects: true,
    });

    return NextResponse.json({
      analysis,
      roadmap,
      needsSetup: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (
      message.includes('Career goal not found') ||
      message.includes('Role not found')
    ) {
      return NextResponse.json({
        analysis: null,
        roadmap: null,
        needsSetup: true,
      });
    }

    console.error('GET /api/roadmap error:', error);

    return NextResponse.json(
      { error: 'Failed to generate roadmap' },
      { status: 500 }
    );
  }
}
