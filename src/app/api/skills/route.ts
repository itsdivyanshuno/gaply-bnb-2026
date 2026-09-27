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

    try {
      const analysis = await skillGapService.analyzeSkillGaps(studentId);
      const priorities =
        await prioritizationService.prioritizeSkillsForStudent(studentId);

      return NextResponse.json({
        analysis,
        priorities,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';

      if (
        message.includes('Career goal not found') ||
        message.includes('Role not found')
      ) {
        return NextResponse.json({
          analysis: null,
          priorities: [],
          needsSetup: true,
        });
      }

      throw error;
    }
  } catch (error) {
    console.error('GET /api/skills error:', error);

    return NextResponse.json(
      { error: 'Failed to load skills data' },
      { status: 500 }
    );
  }
}
