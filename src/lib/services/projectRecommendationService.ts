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

export type ProjectRecommendation = {
  projectId: string;
  projectName: string;
  projectDescription: string;
  coverageScore: number; // 0-100, how much this project addresses skill gaps
  addressedSkills: Array<{
    skillId: string;
    skillName: string;
    gapBefore: number; // Negative = deficit
    gapAfter: number; // Negative = deficit after project
    improvement: number; // Points of improvement
  }>;
  missingSkills: Array<{
    skillId: string;
    skillName: string;
    gap: number; // Negative = deficit
  }>;
  explanation: string;
  estimatedHours: number;
  difficulty: string;
};

export class ProjectRecommendationService {
  private studentRepo = getStudentRepository();
  private careerGoalRepo = getCareerGoalRepository();
  private skillRepo = getSkillRepository();
  private roleRepo = getRoleRepository();
  private roleSkillRepo = getRoleSkillRepository();
  private studentSkillRepo = getStudentSkillRepository();
  private evidenceRepo = getEvidenceRepository();
  private projectRepo = getProjectRepository();
  private projectSkillRepo = getProjectSkillRepository();

  async recommendProjectsForStudent(studentId: string, maxResults: number = 3): Promise<ProjectRecommendation[]> {
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

    // Get all projects
    const projects = await this.projectRepo.findMany();

    // Get all project-skill mappings
    const projectSkills = await this.projectSkillRepo.findMany();

    // Get student's current skills
    const studentSkills = await this.studentSkillRepo.findMany({ where: { studentId: studentId } });

    // Calculate recommendation scores for each project
    const projectRecommendations: ProjectRecommendation[] = [];

    for (const project of projects) {
      // Get skills required for this project
      const projectSkillMappings = projectSkills.filter(ps => ps.projectId === project.id);

      if (projectSkillMappings.length === 0) continue; // Skip projects with no skill mappings

      // Calculate how much this project addresses the student's skill gaps
      let coverageScore = 0;
      const addressedSkills: Array<{
        skillId: string;
        skillName: string;
        gapBefore: number;
        gapAfter: number;
        improvement: number;
      }> = [];
      const missingSkills: Array<{
        skillId: string;
        skillName: string;
        gap: number;
      }> = [];

      // For each skill in the project
      for (const projectSkill of projectSkillMappings) {
        const skill = await this.skillRepo.findUnique({ where: { id: projectSkill.skillId } });
        if (!skill) continue;

        // Find student's current proficiency for this skill
        const studentSkill = studentSkills.find(ss => ss.skillId === skill.id);
        const currentProficiency = studentSkill ? studentSkill.currentProficiency : 0;

        // Find the required proficiency for this skill in the target role
        const roleSkill = await this.roleSkillRepo.findFirst({
          where: { roleId: role.id, skillId: skill.id }
        });
        const requiredProficiency = roleSkill ? roleSkill.requiredProficiency : 0;

        // Calculate gap before project
        const gapBefore = currentProficiency - requiredProficiency;

        // Estimate gap after project (assuming project provides the projectSkill.relevance points of improvement)
        const improvementFromProject = projectSkill.relevance;
        const proficiencyAfterProject = Math.min(100, currentProficiency + improvementFromProject);
        const gapAfter = proficiencyAfterProject - requiredProficiency;

        // Only count as addressed if it reduces the gap (makes it less negative or more positive)
        const gapImprovement = gapAfter - gapBefore; // Positive = improvement

        if (gapImprovement > 0) {
          addressedSkills.push({
            skillId: skill.id,
            skillName: skill.name,
            gapBefore: gapBefore,
            gapAfter: gapAfter,
            improvement: Math.round(gapImprovement * 10) / 10
          });

          // Add to coverage score: weighted by how much the gap is reduced and skill importance
          const skillImportance = roleSkill ? roleSkill.importance / 100 : 0.5;
          const gapReductionRatio = Math.min(gapImprovement / Math.abs(gapBefore), 1); // Cap at 100% gap reduction
          coverageScore += gapReductionRatio * skillImportance * 100;
        } else if (gapBefore < 0) {
          // This is a skill we need but the project doesn't help
          missingSkills.push({
            skillId: skill.id,
            skillName: skill.name,
            gap: gapBefore
          });
        }
      }

      // Normalize coverage score to 0-100
      // Max possible score would be if we addressed all skills with 100% importance
      const allRoleSkills = await this.roleSkillRepo.findMany({ where: { roleId: role.id } });
      const totalPossibleScore = allRoleSkills.reduce((sum, rs) => sum + (rs.importance / 100), 0) * 100;

      const normalizedCoverageScore = totalPossibleScore > 0
        ? Math.min((coverageScore / totalPossibleScore) * 100, 100)
        : 0;

      // Only recommend if it addresses at least one skill gap
      if (addressedSkills.length > 0) {
        // Generate explanation
        let explanation = `This project addresses ${addressedSkills.length} skill gap${addressedSkills.length === 1 ? '' : 's'} for the ${role.name} role. `;

        if (addressedSkills.length >= 3) {
          explanation += `It provides comprehensive coverage of key competencies. `;
        } else if (addressedSkills.length >= 2) {
          explanation += `It addresses multiple important skills. `;
        } else {
          explanation += `It focuses on developing a specific skill area. `;
        }

        // Add details about what skills are addressed
        const skillNames = addressedSkills.map(s => s.skillName);
        if (skillNames.length <= 3) {
          explanation += `Specifically, it helps develop: ${skillNames.join(', ')}. `;
        } else {
          explanation += `Specifically, it helps develop: ${skillNames.slice(0, 3).join(', ')} and ${skillNames.length - 3} more skills. `;
        }

        // Add missing skills context if any
        if (missingSkills.length > 0) {
          explanation += `Note: This project does not address the following skill gaps: ${missingSkills.slice(0, 3).map(m => m.skillName).join(', ')}${missingSkills.length > 3 ? ` and ${missingSkills.length - 3} more` : ''}. `;
        }

        explanation += `With an estimated effort of ${project.estimatedHours || 20} hours at ${project.difficulty || 'Intermediate'} difficulty, `;
        explanation += `it offers a ${Math.round(normalizedCoverageScore)}% match to your current learning needs.`;

        projectRecommendations.push({
          projectId: project.id,
          projectName: project.name,
          projectDescription: project.description || '',
          coverageScore: Math.round(normalizedCoverageScore * 10) / 10,
          addressedSkills,
          missingSkills,
          explanation,
          estimatedHours: project.estimatedHours || 20,
          difficulty: project.difficulty || 'Intermediate'
        });
      }
    }

    // Sort by coverage score (descending) and limit results
    projectRecommendations.sort((a, b) => b.coverageScore - a.coverageScore);
    return projectRecommendations.slice(0, maxResults);
  }
}

export const projectRecommendationService = new ProjectRecommendationService();
