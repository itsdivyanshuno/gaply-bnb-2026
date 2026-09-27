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

    // Get gap analysis before and after
    const gapAnalysisBefore = await skillGapService.analyzeSkillGaps(update.studentId);
    const gapAnalysisAfter = await skillGapService.analyzeSkillGaps(update.studentId);

    // Calculate readiness impact
    const readinessBefore = gapAnalysisBefore.overallReadiness;
    const readinessAfter = gapAnalysisAfter.overallReadiness;
    const readinessImpact = readinessAfter - readinessBefore;

    // Get roadmap adjustment suggestions based on this progress
    const roadmapSuggestions = await roadmapService.suggestRoadmapAdjustments(update.studentId);

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
      roadmapSuggestions
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
    const student = await this.studentRepo.findUnique({ where: { id: studentId } });
    if (!student) throw new Error(`Student not found: ${studentId}`);

    const skill = await this.skillRepo.findUnique({ where: { id: skillId } });
    if (!skill) throw new Error(`Skill not found: ${skillId}`);

    // Get career goal and role
    const careerGoal = await this.careerGoalRepo.findFirst({ where: { studentId: studentId } });
    if (!careerGoal) throw new Error(`Career goal not found`);

    const role = await this.roleRepo.findFirst({ where: { name: careerGoal.targetRole } });
    if (!role) throw new Error(`Role not found`);

    const roleSkill = await this.roleSkillRepo.findFirst({
      where: { roleId: role.id, skillId: skillId }
    });
    const requiredProficiency = roleSkill ? roleSkill.requiredProficiency : 0;

    const studentSkill = await this.studentSkillRepo.findFirst({
      where: { studentId, skillId }
    });
    const currentProficiency = studentSkill ? studentSkill.currentProficiency : 0;

    // Calculate recommended hours to reach target
    const proficiencyGap = requiredProficiency - currentProficiency;
    const recommendedHours = proficiencyGap > 0 ? proficiencyGap * 2 : 0; // 2 hours per point as heuristic

    // Generate resource recommendations based on skill
    const resources: Array<{
      type: string;
      title: string;
      description: string;
      url?: string;
      estimatedHours: number;
    }> = [];

    switch (skill.name) {
      case 'JavaScript':
        resources.push(
          { type: 'COURSE', title: 'JavaScript Algorithms and Data Structures', description: 'Learn JS fundamentals to advanced topics', estimatedHours: 20, url: '#' },
          { type: 'PROJECT', title: 'Build a Weather App', description: 'Create a weather application using JavaScript APIs', estimatedHours: 15, url: '#' },
          { type: 'EXERCISE', title: 'JavaScript Coding Challenges', description: 'Practice with coding challenges on platforms like LeetCode', estimatedHours: 10, url: '#' }
        );
        break;
      case 'React':
        resources.push(
          { type: 'COURSE', title: 'Complete React Developer', description: 'Learn React hooks, context, and advanced patterns', estimatedHours: 25, url: '#' },
          { type: 'PROJECT', title: 'Build an E-commerce Site', description: 'Create a full e-commerce application with React', estimatedHours: 30, url: '#' },
          { type: 'ARTICLE', title: 'React Best Practices 2024', description: 'Learn the latest React patterns and performance optimizations', estimatedHours: 3, url: '#' }
        );
        break;
      case 'Node.js':
        resources.push(
          { type: 'COURSE', title: 'Node.js, Express, MongoDB', description: 'Learn backend development with Node.js stack', estimatedHours: 30, url: '#' },
          { type: 'PROJECT', title: 'Build a REST API for a Blog', description: 'Create a blogging platform with Node.js and Express', estimatedHours: 25, url: '#' },
          { type: 'EXERCISE', title: 'Database Design Exercises', description: 'Practice designing schemas and writing queries', estimatedHours: 10, url: '#' }
        );
        break;
      case 'PostgreSQL':
        resources.push(
          { type: 'COURSE', title: 'SQL and PostgreSQL Mastery', description: 'Learn SQL queries, database design, and optimization', estimatedHours: 25, url: '#' },
          { type: 'PROJECT', title: 'Design a Social Media Database', description: 'Create the database schema for a social media platform', estimatedHours: 20, url: '#' },
          { type: 'EXERCISE', title: 'Query Optimization Practice', description: 'Learn to write efficient SQL queries', estimatedHours: 15, url: '#' }
        );
        break;
      default:
        resources.push(
          { type: 'ARTICLE', title: `Learn ${skill.name}`, description: `Comprehensive guide to learning ${skill.name}`, estimatedHours: 15, url: '#' },
          { type: 'PROJECT', title: `Build something with ${skill.name}`, description: `Apply ${skill.name} in a practical project`, estimatedHours: 20, url: '#' }
        );
    }

    return {
      skillName: skill.name,
      currentLevel: currentProficiency,
      targetLevel: requiredProficiency,
      recommendedHours: Math.round(recommendedHours),
      resources
    };
  }
}

export const progressService = new ProgressService();
