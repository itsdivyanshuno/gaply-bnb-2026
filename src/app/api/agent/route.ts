import { NextRequest, NextResponse } from 'next/server';
import { careerAgentService } from '@/lib/services/careerAgentService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const studentId =
      typeof body.studentId === 'string' ? body.studentId.trim() : '';

    const question =
      typeof body.question === 'string' ? body.question.trim() : '';

    const availableHours =
      body.availableHours != null
        ? Number(body.availableHours)
        : undefined;

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }

    if (availableHours !== undefined) {
      if (
        !Number.isFinite(availableHours) ||
        availableHours <= 0
      ) {
        return NextResponse.json(
          { error: 'availableHours must be a positive number' },
          { status: 400 }
        );
      }
    }

    const response = await careerAgentService.respond({
      studentId,
      question: question || undefined,
      availableHours,
    });

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (message === 'Student not found') {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    if (message === 'Career goal not found') {
      return NextResponse.json(
        {
          error: 'Career goal not found',
          needsSetup: true,
        },
        { status: 400 }
      );
    }

    console.error('POST /api/agent error:', error);

    return NextResponse.json(
      { error: 'Failed to generate career agent response' },
      { status: 500 }
    );
  }
}
