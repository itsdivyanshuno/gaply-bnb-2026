import { NextRequest, NextResponse } from 'next/server';
import { progressService } from '@/lib/services/progressService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const studentId =
      typeof body.studentId === 'string' ? body.studentId.trim() : '';

    const skillId =
      typeof body.skillId === 'string' ? body.skillId.trim() : '';

    const newProficiency = Number(body.newProficiency);
    const confidence =
      body.confidence == null ? 0.8 : Number(body.confidence);

    const description =
      typeof body.description === 'string'
        ? body.description.trim()
        : undefined;

    if (!studentId || !skillId) {
      return NextResponse.json(
        { error: 'studentId and skillId are required' },
        { status: 400 },
      );
    }

    if (
      !Number.isFinite(newProficiency) ||
      newProficiency < 0 ||
      newProficiency > 100
    ) {
      return NextResponse.json(
        { error: 'newProficiency must be between 0 and 100' },
        { status: 400 },
      );
    }

    if (
      !Number.isFinite(confidence) ||
      confidence < 0 ||
      confidence > 1
    ) {
      return NextResponse.json(
        { error: 'confidence must be between 0 and 1' },
        { status: 400 },
      );
    }

    const result = await progressService.updateSkillProficiency({
      studentId,
      skillId,
      newProficiency,
      confidence,
      description,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (message.startsWith('Student not found')) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 },
      );
    }

    if (message.startsWith('Career goal not found')) {
      return NextResponse.json(
        {
          error: 'Career goal not found',
          needsSetup: true,
        },
        { status: 400 },
      );
    }

    if (message.startsWith('Skill not found')) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 },
      );
    }

    console.error('POST /api/progress error:', error);

    return NextResponse.json(
      { error: 'Failed to update skill progress' },
      { status: 500 },
    );
  }
}
