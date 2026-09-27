import {
  getCareerGoalRepository,
  getStudentRepository,
  getStudentSkillRepository,
  getEvidenceRepository,
  getRoadmapRepository,
} from '@/lib/data/store';

import { skillGapService } from './skillGapService';
import { prioritizationService } from './prioritizationService';
import { projectRecommendationService } from './projectRecommendationService';

type AgentIntent =
  | 'WEEKLY_PLAN'
  | 'SKILL_EXPLANATION'
  | 'PROJECT_RECOMMENDATION'
  | 'ROADMAP'
  | 'GENERAL';

type AgentRequest = {
  studentId: string;
  question?: string;
  availableHours?: number;
};

type FocusSkill = {
  skillId: string;
  skillName: string;
  current: number;
  required: number;
  gap: number;
  priorityScore: number;
  rank: number;
  why: string;
};

type AgentPlanItem = {
  title: string;
  type: 'LEARN' | 'BUILD' | 'PRACTICE';
  hours: number;
  reason: string;
};

export type CareerAgentResponse = {
  answer: string;
  intent: AgentIntent;
  focusSkills: FocusSkill[];
  plan: AgentPlanItem[];
  projects: Array<{
    projectId: string;
    projectName: string;
    estimatedHours: number;
    difficulty: string;
    explanation: string;
  }>;
  context: {
    targetRole: string;
    weeklyAvailability: number;
    readiness: number;
  };
  sourceData: {
    skillGaps: number;
    prioritizedSkills: number;
    evidenceCount: number;
  };
};

function detectIntent(question: string): AgentIntent {
  const q = question.toLowerCase();

  if (
    q.includes('this week') ||
    q.includes('week') ||
    q.includes('hours') ||
    q.includes('focus') ||
    q.includes('plan')
  ) {
    return 'WEEKLY_PLAN';
  }

  if (
    q.includes('why') ||
    q.includes('skill') ||
    q.includes('gap') ||
    q.includes('learn')
  ) {
    return 'SKILL_EXPLANATION';
  }

  if (
    q.includes('project') ||
    q.includes('build') ||
    q.includes('portfolio')
  ) {
    return 'PROJECT_RECOMMENDATION';
  }

  if (
    q.includes('roadmap') ||
    q.includes('next') ||
    q.includes('progress')
  ) {
    return 'ROADMAP';
  }

  return 'GENERAL';
}

function extractHours(question: string): number | null {
  const match = question.match(
    /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/i
  );

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);

  if (!Number.isFinite(hours) || hours <= 0) {
    return null;
  }

  return Math.min(hours, 80);
}

export class CareerAgentService {
  async respond(request: AgentRequest): Promise<CareerAgentResponse> {
    const studentRepo = getStudentRepository();
    const careerGoalRepo = getCareerGoalRepository();
    const studentSkillRepo = getStudentSkillRepository();
    const evidenceRepo = getEvidenceRepository();

    const student = await studentRepo.findUnique({
      where: { id: request.studentId },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const careerGoal = await careerGoalRepo.findUnique({
      where: { studentId: request.studentId },
    });

    if (!careerGoal) {
      throw new Error('Career goal not found');
    }

    const question = request.question?.trim() || 'What should I focus on this week?';

    const intent = detectIntent(question);

    const analysis =
      await skillGapService.analyzeSkillGaps(request.studentId);

    const priorities =
      await prioritizationService.prioritizeSkillsForStudent(
        request.studentId
      );

    const projects =
      await projectRecommendationService.recommendProjectsForStudent(
        request.studentId,
        3
      );

    const evidence = await evidenceRepo.findMany({
      where: { studentId: request.studentId },
    });

    const extractedHours = extractHours(question);

    const weeklyAvailability =
      request.availableHours ||
      extractedHours ||
      careerGoal.weeklyAvailability ||
      student.weeklyAvailability ||
      10;

    const topPriorities = priorities.slice(0, 3);

    const focusSkills: FocusSkill[] = topPriorities.map((priority) => {
      const gap = analysis.skillGaps.find(
        (item) => item.skillId === priority.skillId
      );

      const current = gap?.currentProficiency ?? 0;
      const required = gap?.requiredProficiency ?? 0;

      return {
        skillId: priority.skillId,
        skillName: priority.skillName,
        current,
        required,
        gap: Math.max(0, required - current),
        priorityScore: priority.priorityScore,
        rank: priority.rank,
        why: priority.explanation,
      };
    });

    const plan = this.buildWeeklyPlan(
      weeklyAvailability,
      topPriorities,
      projects
    );

    const answer = this.buildAnswer({
      intent,
      question,
      targetRole: careerGoal.targetRole,
      weeklyAvailability,
      readiness: analysis.overallReadiness,
      focusSkills,
      allSkillGaps: analysis.skillGaps,
      plan,
      projects,
    });

    return {
      answer,
      intent,
      focusSkills,
      plan,
      projects: projects.map((project) => ({
        projectId: project.projectId,
        projectName: project.projectName,
        estimatedHours: project.estimatedHours,
        difficulty: project.difficulty,
        explanation: project.explanation,
      })),
      context: {
        targetRole: careerGoal.targetRole,
        weeklyAvailability,
        readiness: analysis.overallReadiness,
      },
      sourceData: {
        skillGaps: analysis.skillGaps.length,
        prioritizedSkills: priorities.length,
        evidenceCount: evidence.length,
      },
    };
  }

  private buildWeeklyPlan(
    availableHours: number,
    priorities: any[],
    projects: any[]
  ): AgentPlanItem[] {
    if (availableHours <= 0) {
      return [];
    }

    const plan: AgentPlanItem[] = [];

    const topSkill = priorities[0];

    if (topSkill) {
      const learningHours = Math.min(
        Math.max(2, Math.round(availableHours * 0.4)),
        availableHours
      );

      plan.push({
        title: `Strengthen ${topSkill.skillName}`,
        type: 'LEARN',
        hours: learningHours,
        reason: topSkill.explanation,
      });
    }

    const remainingAfterLearning =
      availableHours - (plan[0]?.hours || 0);

    if (remainingAfterLearning > 0 && projects.length > 0) {
      const project = projects[0];

      plan.push({
        title: `Build: ${project.projectName}`,
        type: 'BUILD',
        hours: Math.min(
          remainingAfterLearning,
          Math.max(2, Math.ceil(project.estimatedHours * 0.25))
        ),
        reason: project.explanation,
      });
    }

    const usedHours = plan.reduce(
      (total, item) => total + item.hours,
      0
    );

    const remaining = availableHours - usedHours;

    if (remaining > 0 && priorities.length > 1) {
      const secondSkill = priorities[1];

      plan.push({
        title: `Practice ${secondSkill.skillName}`,
        type: 'PRACTICE',
        hours: remaining,
        reason: secondSkill.explanation,
      });
    }

    return plan;
  }

  private buildAnswer(data: {
    intent: AgentIntent;
    question: string;
    targetRole: string;
    weeklyAvailability: number;
    readiness: number;
    focusSkills: FocusSkill[];
    allSkillGaps: any[];
    plan: AgentPlanItem[];
    projects: any[];
  }): string {
    const {
      intent,
      targetRole,
      weeklyAvailability,
      readiness,
      focusSkills,
      allSkillGaps,
      plan,
      projects,
    } = data;

    if (intent === 'WEEKLY_PLAN') {
      const focus = focusSkills
        .slice(0, 2)
        .map((skill) => skill.skillName)
        .join(' and ');

      const planText = plan
        .map((item) => `${item.title} (${item.hours}h)`)
        .join(', ');

      return `For your ${targetRole} goal, your current readiness is ${readiness}%. With ${weeklyAvailability} hours available, focus first on ${focus || 'your highest-priority skill gaps'}. Suggested plan: ${planText || 'start with your highest-priority skill gap and build evidence for it'}.`;
    }

    if (intent === 'SKILL_EXPLANATION') {
      if (focusSkills.length === 0) {
        return `Your current profile does not show a major skill deficit for ${targetRole}. Continue building evidence and reassess your skills regularly.`;
      }

      const normalizedQuestion = data.question.toLowerCase();

      const requestedSkill = data.allSkillGaps.find((skill: any) =>
        normalizedQuestion.includes(skill.skillName.toLowerCase())
      );

      if (requestedSkill) {
        const current = requestedSkill.currentProficiency ?? 0;
        const required = requestedSkill.requiredProficiency ?? 0;
        const gap = Math.max(0, required - current);

        return `${requestedSkill.skillName} is currently ${current}/100 while your target role requires ${required}/100. That creates a ${gap}-point gap. It is prioritized because of the role requirement, gap size, project relevance, dependencies, and confidence in your current assessment.`;
      }

      const skill = focusSkills[0];

      return `${skill.skillName} is currently ${skill.current}/100 while your target role requires ${skill.required}/100. That creates a ${skill.gap}-point gap. It is prioritized because of the role requirement, gap size, project relevance, dependencies, and confidence in your current assessment.`;
    }

    if (intent === 'PROJECT_RECOMMENDATION') {
      if (projects.length === 0) {
        return `I don't have a project recommendation that directly addresses your current skill gaps yet.`;
      }

      const project = projects[0];

      return `Based on your current gaps, ${project.projectName} is recommended because it can provide evidence for skills you still need to strengthen. Estimated effort is ${project.estimatedHours} hours.`;
    }

    if (intent === 'ROADMAP') {
      return `Your roadmap should currently prioritize ${focusSkills
        .slice(0, 3)
        .map((skill) => skill.skillName)
        .join(', ') || 'your remaining skill gaps'
        }. As your assessments, evidence, and progress change, these priorities can be recalculated.`;
    }

    return `Your GAPLY profile is targeting ${targetRole}. Current readiness is ${readiness}%. The agent is using your skill gaps, role requirements, priorities, projects, and evidence to generate recommendations.`;
  }
}

export const careerAgentService = new CareerAgentService();
