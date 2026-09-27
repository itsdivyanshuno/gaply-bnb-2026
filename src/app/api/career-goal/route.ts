import { NextRequest, NextResponse } from 'next/server';
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

    return NextResponse.json(careerGoal);
  } catch (error) {
    console.error('GET /api/career-goal error:', error);

    return NextResponse.json(
      { error: 'Failed to load career goal' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      studentId,
      targetRole,
      experienceLevel,
      timelineMonths,
      preferredTechnologies,
      weeklyAvailability,
    } = body;

    if (!studentId || !targetRole || !experienceLevel) {
      return NextResponse.json(
        {
          error:
            'studentId, targetRole and experienceLevel are required',
        },
        { status: 400 }
      );
    }

    const careerGoalRepo = getCareerGoalRepository();

    const existingGoal = await careerGoalRepo.findUnique({
      where: { studentId },
    });

    const data = {
      studentId,
      targetRole,
      experienceLevel,
      timelineMonths,
      preferredTechnologies,
      weeklyAvailability,
    };

    const result = existingGoal
      ? await careerGoalRepo.update({
          where: { id: existingGoal.id },
          data,
        })
      : await careerGoalRepo.create({
          data,
        });

    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/career-goal error:', error);

    return NextResponse.json(
      { error: 'Failed to save career goal' },
      { status: 500 }
    );
  }
}
