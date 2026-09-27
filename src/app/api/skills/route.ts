import { NextRequest, NextResponse } from 'next/server';
import { skillGapService } from '@/lib/services/skillGapService';
import { prioritizationService } from '@/lib/services/prioritizationService';

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
    const priorities =
      await prioritizationService.prioritizeSkillsForStudent(studentId);

    return NextResponse.json({
      analysis,
      priorities,
    });
  } catch (error) {
    console.error('GET /api/skills error:', error);

    return NextResponse.json(
      { error: 'Failed to load skills data' },
      { status: 500 }
    );
  }
}
