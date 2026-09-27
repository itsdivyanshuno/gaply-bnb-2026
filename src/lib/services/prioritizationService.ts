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

export type SkillPriority = {
  skillId: string;
  skillName: string;
  priorityScore: number; // Higher = higher priority
  rank: number;
  factors: {
    gapSize: number; // Absolute gap (0-100)
    roleImportance: number; // 0-100
    gapPercentage: number; // Gap as % of required
    confidence: number; // 0-1 (lower = higher priority)
    projectRelevance: number; // 0-100 (how much projects need this skill)
    dependencyScore: number; // 0-100 (how many other skills depend on this)
    learningEffort: number; // Estimated hours to learn (lower = higher priority)
  };
  explanation: string;
};

export class PrioritizationService {
  private studentRepo = getStudentRepository();
  private careerGoalRepo = getCareerGoalRepository();
  private skillRepo = getSkillRepository();
  private roleRepo = getRoleRepository();
  private roleSkillRepo = getRoleSkillRepository();
  private studentSkillRepo = getStudentSkillRepository();
  private evidenceRepo = getEvidenceRepository();
  private projectRepo = getProjectRepository();
  private projectSkillRepo = getProjectSkillRepository();

  async prioritizeSkillsForStudent(studentId: string): Promise<SkillPriority[]> {
    // Get student and career goal
    const student = await this.studentRepo.findUnique({ where: { id: studentId } });
    if (!student) throw new Error(`Student not found: ${studentId}`);

    const careerGoal = await this.careerGoalRepo.findFirst({ where: { studentId: studentId } });
    if (!careerGoal) throw new Error(`Career goal not found for student: ${studentId}`);

    // Get target role
    const role = await this.roleRepo.findFirst({ where: { name: careerGoal.targetRole } });
    if (!role) throw new Error(`Role not found: ${careerGoal.targetRole}`);

    // Get skill gap analysis
    const gapAnalysis = await skillGapService.analyzeSkillGaps(studentId);

    // Get all skills for this role
    const roleSkills = await this.roleSkillRepo.findMany({ where: { roleId: role.id } });

    // Get student's current skills
    const studentSkills = await this.studentSkillRepo.findMany({ where: { studentId: studentId } });

    // Get evidence for this student
    const evidence = await this.evidenceRepo.findMany({ where: { studentId: studentId } });

    // Get all projects and their skill mappings
    const projects = await this.projectRepo.findMany();
    const projectSkills = await this.projectSkillRepo.findMany();

    // Calculate prioritization scores for each skill with a deficit
    const skillPriorities: SkillPriority[] = [];

    for (const gap of gapAnalysis.skillGaps) {
      if (gap.gap >= 0) continue; // Skip skills with no deficit (surplus or met)

      const skill = await this.skillRepo.findUnique({ where: { id: gap.skillId } });
      if (!skill) continue;

      const roleSkill = roleSkills.find(rs => rs.skillId === skill.id);
      if (!roleSkill) continue;

      // Get student skill for confidence
      const studentSkill = studentSkills.find(ss => ss.skillId === skill.id);

      // Calculate project relevance: how many projects need this skill and how much
      let projectRelevance = 0;
      const projectSkillMappings = projectSkills.filter(ps => ps.skillId === skill.id);
      if (projectSkillMappings.length > 0 && projects.length > 0) {
        // Average relevance across projects that use this skill
        const totalRelevance = projectSkillMappings.reduce((sum, ps) => sum + ps.relevance, 0);
        const maxPossibleRelevance = projectSkillMappings.length * 100;
        projectRelevance = (totalRelevance / maxPossibleRelevance) * 100;
      }

      // Calculate dependency score: how many other skills have this as a prerequisite
      // For simplicity, we'll use a heuristic based on skill category and common dependencies
      let dependencyScore = 50; // Default middle value
      switch (skill.name) {
        case 'JavaScript':
          dependencyScore = 90; // Many skills depend on JS
          break;
        case 'Git':
          dependencyScore = 80; // Used in almost all projects
          break;
        case 'System Design':
          dependencyScore = 70; // Important for complex projects
          break;
        case 'Testing':
          dependencyScore = 60; // Important for quality
          break;
        default:
          dependencyScore = 40; // Lower dependency
      }

      // Estimate learning effort (hours) - simpler heuristic
      let learningEffort = 20; // Default
      const gapSize = Math.abs(gap.gap);
      if (gapSize > 30) learningEffort = 40;
      else if (gapSize > 15) learningEffort = 25;

      // Adjust based on skill complexity
      switch (skill.name) {
        case 'System Design':
          learningEffort += 20;
          break;
        case 'PostgreSQL':
          learningEffort += 15;
          break;
        case 'Docker':
          learningEffort += 10;
          break;
        case 'JavaScript':
        case 'React':
        case 'Node.js':
          learningEffort += 5;
          break;
      }

      // Calculate priority score (weighted formula)
      // Weights: gapSize (30%), roleImportance (25%), projectRelevance (20%),
      //         dependencyScore (15%), confidence inversion (10%)
      const normalizedGapSize = Math.min(Math.abs(gap.gap) / 100, 1); // 0-1
      const normalizedRoleImportance = roleSkill.importance / 100; // 0-1
      const normalizedProjectRelevance = projectRelevance / 100; // 0-1
      const normalizedDependencyScore = dependencyScore / 100; // 0-1
      const normalizedConfidence = 1 - (studentSkill ? studentSkill.confidence : 0.5); // 0-1 (lower confidence = higher priority)

      const priorityScore = (
        normalizedGapSize * 0.30 +
        normalizedRoleImportance * 0.25 +
        normalizedProjectRelevance * 0.20 +
        normalizedDependencyScore * 0.15 +
        normalizedConfidence * 0.10
      ) * 100; // Convert to 0-100 scale

      // Generate explanation
      let explanation = `Prioritized because: `;
      const factors = [];

      const absoluteGap = Math.abs(gap.gap);

      if (absoluteGap >= 40) {
        factors.push(`large skill gap (${absoluteGap} points)`);
      } else if (absoluteGap >= 20) {
        factors.push(`moderate skill gap (${absoluteGap} points)`);
      } else {
        factors.push(`small skill gap (${absoluteGap} points)`);
      }

      if (normalizedRoleImportance > 0.8) factors.push(`high importance for role (${roleSkill.importance}/100)`);
      else if (normalizedRoleImportance > 0.6) factors.push(`moderate importance for role (${roleSkill.importance}/100)`);
      else factors.push(`lower importance for role (${roleSkill.importance}/100)`);

      if (normalizedProjectRelevance > 0.7) factors.push(`highly relevant to projects (${Math.round(projectRelevance)}%)`);
      else if (normalizedProjectRelevance > 0.4) factors.push(`moderately relevant to projects (${Math.round(projectRelevance)}%)`);
      else factors.push(`less relevant to projects (${Math.round(projectRelevance)}%)`);

      if (normalizedDependencyScore > 0.7) factors.push(`many other skills depend on this`);
      else if (normalizedDependencyScore > 0.4) factors.push(`some other skills depend on this`);
      else factors.push(`few other skills depend on this`);

      if (normalizedConfidence > 0.6) factors.push(`low confidence in current assessment`);
      else if (normalizedConfidence > 0.3) factors.push(`moderate confidence in current assessment`);
      else factors.push(`high confidence in current assessment`);

      explanation += factors.join('; ') + `.`;

      skillPriorities.push({
        skillId: skill.id,
        skillName: skill.name,
        priorityScore: Math.round(priorityScore * 10) / 10, // Round to 1 decimal
        rank: 0, // Will be set after sorting
        factors: {
          gapSize: Math.abs(gap.gap),
          roleImportance: roleSkill.importance,
          gapPercentage: gap.gapPercentage,
          confidence: studentSkill ? studentSkill.confidence : 0.5,
          projectRelevance: Math.round(projectRelevance),
          dependencyScore: Math.round(dependencyScore),
          learningEffort
        },
        explanation
      });
    }

    // Sort by priority score (descending) and assign ranks
    skillPriorities.sort((a, b) => b.priorityScore - a.priorityScore);
    skillPriorities.forEach((priority, index) => {
      priority.rank = index + 1;
    });

    return skillPriorities;
  }
}

export const prioritizationService = new PrioritizationService();
