import { NextRequest, NextResponse } from 'next/server';
import { projectRecommendationService } from '@/lib/services/projectRecommendationService';
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

    const recommendations =
      await projectRecommendationService.recommendProjectsForStudent(
        studentId,
        5
      );

    return NextResponse.json({
      analysis,
      recommendations,
    });
  } catch (error) {
    console.error('GET /api/projects error:', error);

    return NextResponse.json(
      { error: 'Failed to load project recommendations' },
      { status: 500 }
    );
  }
}
