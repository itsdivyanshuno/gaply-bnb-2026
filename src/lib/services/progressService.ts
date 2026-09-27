import { 
  getStudentRepository, 
  getCareerGoalRepository, 
  getSkillRepository, 
  getRoleRepository, 
  getRoleSkillRepository, 
  getStudentSkillRepository,
  getEvidenceRepository,
  getProjectRepository,
  getProjectSkillRepository
} from '../data';
import { skillGapService } from './skillGapService';
import { roadmapService } from './roadmapService';

export type ProgressUpdate = {
  studentId: string;
  skillId: string;
  newProficiency: number; // 0-100
  confidence: number; // 0-1
  evidenceId?: string;
  description?: string;
};

export type ProgressImpact = {
  skillId: string;
  skillName: string;
  oldProficiency: number;
  newProficiency: number;
  proficiencyChange: number;
  gapChange: number; // Change in gap (negative = improvement)
  gapBefore: number;
  gapAfter: number;
  readinessImpact: number; // Impact on overall readiness percentage
};

export class ProgressService {
  private studentRepo = getStudentRepository();
  private careerGoalRepo = getCareerGoalRepository();
  private skillRepo = getSkillRepository();
  private roleRepo = getRoleRepository();
  private roleSkillRepo = getRoleSkillRepository();
  private studentSkillRepo = getStudentSkillRepository();
  private evidenceRepo = getEvidenceRepository();

  async updateSkillProficiency(update: ProgressUpdate): Promise<{
    studentSkill: any;
    impact: ProgressImpact;
    gapAnalysisBefore: any;
    gapAnalysisAfter: any;
    roadmapSuggestions: any;
    adaptiveRoadmap: any;
  }> {
    // Get student
    const student = await this.studentRepo.findUnique({ where: { id: update.studentId } });
    if (!student) throw new Error(`Student not found: ${update.studentId}`);

    // Get career goal
    const careerGoal = await this.careerGoalRepo.findFirst({ where: { studentId: update.studentId } });
    if (!careerGoal) throw new Error(`Career goal not found for student: ${update.studentId}`);

    // Get target role
    const role = await this.roleRepo.findFirst({ where: { name: careerGoal.targetRole } });
    if (!role) throw new Error(`Role not found: ${careerGoal.targetRole}`);

    // Get skill
    const skill = await this.skillRepo.findUnique({ where: { id: update.skillId } });
    if (!skill) throw new Error(`Skill not found: ${update.skillId}`);

    // Get current student skill
    const currentStudentSkill = await this.studentSkillRepo.findFirst({
      where: { studentId: update.studentId, skillId: update.skillId }
    });

    const oldProficiency = currentStudentSkill ? currentStudentSkill.currentProficiency : 0;
    const oldConfidence = currentStudentSkill ? currentStudentSkill.confidence : 0.5;

    // Get required proficiency for this skill in the target role
    const roleSkill = await this.roleSkillRepo.findFirst({
      where: { roleId: role.id, skillId: skill.id }
    });
    const requiredProficiency = roleSkill ? roleSkill.requiredProficiency : 0;

    // Capture the complete skill-gap state before making the update.
    const gapAnalysisBefore = await skillGapService.analyzeSkillGaps(
      update.studentId
    );

    // Calculate gap before update
    const gapBefore = oldProficiency - requiredProficiency;

    // Create or update student skill
    let studentSkill;
    if (currentStudentSkill) {
      // Update existing record
      studentSkill = await this.studentSkillRepo.update({
        where: { id: currentStudentSkill.id },
        data: {
          currentProficiency: update.newProficiency,
          confidence: update.confidence,
          lastAssessed: new Date()
        }
      });
    } else {
      // Create new record
      studentSkill = await this.studentSkillRepo.create({
        data: {
          studentId: update.studentId,
          skillId: update.skillId,
          currentProficiency: update.newProficiency,
          confidence: update.confidence,
          lastAssessed: new Date()
        }
      });
    }

    // Calculate gap after update
    const gapAfter = update.newProficiency - requiredProficiency;
    const proficiencyChange = update.newProficiency - oldProficiency;
    const gapChange = gapAfter - gapBefore; // Negative = improvement (gap decreased)

    // Recalculate after the skill update so we can measure the actual impact.
    const gapAnalysisAfter = await skillGapService.analyzeSkillGaps(
      update.studentId
    );

    // Calculate readiness impact
    const readinessBefore = gapAnalysisBefore.overallReadiness;
    const readinessAfter = gapAnalysisAfter.overallReadiness;
    const readinessImpact = readinessAfter - readinessBefore;

    // Recalculate the roadmap immediately after skill progress.
    // The roadmap service preserves existing completed/in-progress items
    // while updating the learning plan around the student's new priorities.
    let adaptiveRoadmap = null;

    if (
      careerGoal.timelineMonths != null &&
      careerGoal.weeklyAvailability != null
    ) {
      adaptiveRoadmap = await roadmapService.generateRoadmap(update.studentId, {
        weeklyAvailability: careerGoal.weeklyAvailability,
        timelineMonths: careerGoal.timelineMonths,
        includeProjects: true,
      });
    }

    // Keep an explainable adjustment summary for the UI/API.
    const roadmapSuggestions =
      await roadmapService.suggestRoadmapAdjustments(update.studentId);

    // Create evidence if provided
    if (update.evidenceId) {
      // In a full implementation, we'd link this progress update to the evidence
      // For now, we'll just note that evidence was provided
    }

    return {
      studentSkill,
      impact: {
        skillId: skill.id,
        skillName: skill.name,
        oldProficiency,
        newProficiency: update.newProficiency,
        proficiencyChange: Math.round(proficiencyChange * 10) / 10,
        gapChange: Math.round(gapChange * 10) / 10,
        gapBefore: Math.round(gapBefore * 10) / 10,
        gapAfter: Math.round(gapAfter * 10) / 10,
        readinessImpact: Math.round(readinessImpact * 10) / 10
      },
      gapAnalysisBefore,
      gapAnalysisAfter,
      roadmapSuggestions,
      adaptiveRoadmap
    };
  }

  // Simulate learning progress over time (for demo purposes)
  async simulateLearningProgress(studentId: string, skillId: string, hours: number): Promise<any> {
    // Get current skill level
    const studentSkill = await this.studentSkillRepo.findFirst({
      where: { studentId, skillId }
    });
    if (!studentSkill) return null;

    const skill = await this.skillRepo.findUnique({ where: { id: skillId } });
    if (!skill) return null;

    // Get role and required proficiency
    const careerGoal = await this.careerGoalRepo.findFirst({ where: { studentId } });
    if (!careerGoal) return null;

    const role = await this.roleRepo.findFirst({ where: { name: careerGoal.targetRole } });
    if (!role) return null;

    const roleSkill = await this.roleSkillRepo.findFirst({
      where: { roleId: role.id, skillId: skillId }
    });
    const requiredProficiency = roleSkill ? roleSkill.requiredProficiency : 0;

    // Calculate potential improvement based on hours
    // Heuristic: 1 hour of focused learning = 0.5-2 points improvement depending on current level
    const proficiencyPerHour = 0.5 + (studentSkill.currentProficiency / 100) * 1.5; // 0.5-2.0
    const potentialImprovement = hours * proficiencyPerHour;

    // Cap at 100 and don't exceed required proficiency by too much for simplicity
    const newProficiency = Math.min(
      100,
      studentSkill.currentProficiency + potentialImprovement,
      requiredProficiency + 10 // Allow exceeding required by up to 10 points
    );

    // Update the skill
    return await this.updateSkillProficiency({
      studentId,
      skillId,
      newProficiency,
      confidence: Math.min(0.95, studentSkill.confidence + 0.1), // Increase confidence with practice
      description: `Completed ${hours} hours of focused learning`
    });
  }

  // Get learning recommendations for a skill
  async getLearningRecommendations(studentId: string, skillId: string): Promise<{
    skillName: string;
    currentLevel: number;
    targetLevel: number;
    recommendedHours: number;
    resources: Array<{
      type: string;
      title: string;
      description: string;
      url?: string;
      estimatedHours: number;
    }>;
  }> {
    const student = await this.studentRepo.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error(`Student not found: ${studentId}`);
    }

    const skill = await this.skillRepo.findUnique({
      where: { id: skillId },
    });

    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`);
    }

    // Get the student's career goal and target role.
    const careerGoal = await this.careerGoalRepo.findFirst({
      where: { studentId },
    });

    if (!careerGoal) {
      throw new Error('Career goal not found');
    }

    const role = await this.roleRepo.findFirst({
      where: { name: careerGoal.targetRole },
    });

    if (!role) {
      throw new Error(`Role not found: ${careerGoal.targetRole}`);
    }

    const roleSkill = await this.roleSkillRepo.findFirst({
      where: {
        roleId: role.id,
        skillId,
      },
    });

    const requiredProficiency = roleSkill?.requiredProficiency ?? 0;

    const studentSkill = await this.studentSkillRepo.findFirst({
      where: {
        studentId,
        skillId,
      },
    });

    const currentProficiency =
      studentSkill?.currentProficiency ?? 0;

    // Estimate learning effort from the actual proficiency gap.
    const proficiencyGap = Math.max(
      0,
      requiredProficiency - currentProficiency
    );

    const recommendedHours = Math.round(proficiencyGap * 2);

    // Do not return fabricated courses, projects, articles or
    // placeholder "#" URLs. Real resources should come from a
    // connected resource catalogue/provider.
    const resources: Array<{
      type: string;
      title: string;
      description: string;
      url?: string;
      estimatedHours: number;
    }> = [];

    return {
      skillName: skill.name,
      currentLevel: currentProficiency,
      targetLevel: requiredProficiency,
      recommendedHours,
      resources,
    };
  }

}

export const progressService = new ProgressService();
