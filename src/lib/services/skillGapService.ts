import { 
  getStudentRepository, 
  getCareerGoalRepository, 
  getSkillRepository, 
  getRoleRepository, 
  getRoleSkillRepository, 
  getStudentSkillRepository 
} from '../data';

export type SkillGap = {
  skillId: string;
  skillName: string;
  currentProficiency: number; // 0-100
  requiredProficiency: number; // 0-100
  gap: number; // positive = deficit, negative = surplus
  gapPercentage: number; // gap as percentage of required
  status: 'LOW' | 'MEDIUM' | 'HIGH'; // based on gap size
  confidence: number; // 0-1, confidence in the assessment
  explanation: string; // why this gap exists
};

export type SkillGapAnalysis = {
  studentId: string;
  careerGoalId: string;
  targetRole: string;
  skillGaps: SkillGap[];
  overallReadiness: number; // 0-100, percentage of skills met
  prioritySkills: string[]; // Ordered skill IDs by priority
};

export class SkillGapService {
  private studentRepo = getStudentRepository();
  private careerGoalRepo = getCareerGoalRepository();
  private skillRepo = getSkillRepository();
  private roleRepo = getRoleRepository();
  private roleSkillRepo = getRoleSkillRepository();
  private studentSkillRepo = getStudentSkillRepository();

  async analyzeSkillGaps(studentId: string): Promise<SkillGapAnalysis> {
    // Get student
    const student = await this.studentRepo.findUnique({ where: { id: studentId } });
    if (!student) {
      throw new Error(`Student not found: ${studentId}`);
    }

    // Get career goal for student
    const careerGoal = await this.careerGoalRepo.findFirst({ where: { studentId: studentId } });
    if (!careerGoal) {
      throw new Error(`Career goal not found for student: ${studentId}`);
    }

    // Get target role by name (since targetRole stores the role name, not ID)
    const role = await this.roleRepo.findFirst({ where: { name: careerGoal.targetRole } });
    if (!role) {
      throw new Error(`Role not found: ${careerGoal.targetRole}`);
    }

    // Get all skills required for this role
    const roleSkills = await this.roleSkillRepo.findMany({ where: { roleId: role.id } });

    // Get student's current skills
    const studentSkills = await this.studentSkillRepo.findMany({ where: { studentId: studentId } });

    // Calculate gaps for each required skill
    const skillGaps: SkillGap[] = [];

    for (const roleSkill of roleSkills) {
      const skill = await this.skillRepo.findUnique({ where: { id: roleSkill.skillId } });
      if (!skill) continue;

      // Find student's current proficiency for this skill
      const studentSkill = studentSkills.find(ss => ss.skillId === skill.id);
      const currentProficiency = studentSkill ? studentSkill.currentProficiency : 0;
      const confidence = studentSkill ? studentSkill.confidence : 0.5; // Default confidence if not assessed

      const requiredProficiency = roleSkill.requiredProficiency;
      const gap = currentProficiency - requiredProficiency; // Negative = deficit
      const gapPercentage = requiredProficiency > 0 ? (gap / requiredProficiency) * 100 : 0;

      // Determine status based on absolute gap size
      const absGap = Math.abs(gap);
      let status: 'LOW' | 'MEDIUM' | 'HIGH';
      if (absGap <= 15) {
        status = 'LOW';
      } else if (absGap <= 30) {
        status = 'MEDIUM';
      } else {
        status = 'HIGH';
      }

      // Generate explanation
      let explanation = '';
      if (gap < 0) {
        explanation = `You need to improve ${skill.name} by ${Math.abs(gap)} points to reach the required proficiency of ${requiredProficiency} for a ${role.name}.`;
      } else if (gap > 0) {
        explanation = `You have exceeded the required proficiency for ${skill.name} by ${gap} points. Your current proficiency of ${currentProficiency} is above the required ${requiredProficiency}.`;
      } else {
        explanation = `Your proficiency in ${skill.name} exactly matches the required level of ${requiredProficiency} for a ${role.name}.`;
      }

      // Add context about confidence
      if (confidence < 0.7) {
        explanation += ` This assessment has low confidence (${Math.round(confidence * 100)}%) as there is limited evidence for this skill.`;
      }

      skillGaps.push({
        skillId: skill.id,
        skillName: skill.name,
        currentProficiency,
        requiredProficiency,
        gap,
        gapPercentage: Math.round(gapPercentage * 10) / 10, // Round to 1 decimal place
        status,
        confidence: Math.round(confidence * 100) / 100, // Round to 2 decimal places
        explanation
      });
    }

    // Calculate overall readiness (percentage of skills where gap <= 0)
    const skillsMet = skillGaps.filter(gap => gap.gap >= 0).length;
    const overallReadiness = roleSkills.length > 0 ? Math.round((skillsMet / roleSkills.length) * 100) : 0;

    // Prioritize skills for learning (we'll use a simple prioritization for now)
    // In a full implementation, this would use a separate prioritization service
    const prioritySkills = [...skillGaps]
      .filter(gap => gap.gap < 0) // Only skills with deficit
      .sort((a, b) => {
        // Prioritize by: 1) gap size (larger gap first), 2) importance (from role skill), 3) confidence (lower confidence first)
        const roleSkillA = roleSkills.find(rs => rs.skillId === a.skillId);
        const roleSkillB = roleSkills.find(rs => rs.skillId === b.skillId);
        const importanceA = roleSkillA ? roleSkillA.importance : 50;
        const importanceB = roleSkillB ? roleSkillB.importance : 50;

        if (Math.abs(b.gap) !== Math.abs(a.gap)) {
          return Math.abs(b.gap) - Math.abs(a.gap); // Larger gap first
        }
        if (importanceB !== importanceA) {
          return importanceB - importanceA; // Higher importance first
        }
        return a.confidence - b.confidence; // Lower confidence first
      })
      .map(gap => gap.skillId);

    return {
      studentId: student.id,
      careerGoalId: careerGoal.id,
      targetRole: role.name,
      skillGaps,
      overallReadiness,
      prioritySkills
    };
  }

  // Get explanation for why a skill is important for a role
  async getSkillImportanceExplanation(studentId: string, skillId: string): Promise<string> {
    const student = await this.studentRepo.findUnique({ where: { id: studentId } });
    if (!student) return 'Student not found';

    const careerGoal = await this.careerGoalRepo.findFirst({ where: { studentId: studentId } });
    if (!careerGoal) return 'No career goal found';

    const role = await this.roleRepo.findFirst({ where: { name: careerGoal.targetRole } });
    if (!role) return 'Role not found';

    const skill = await this.skillRepo.findUnique({ where: { id: skillId } });
    if (!skill) return 'Skill not found';

    const roleSkill = await this.roleSkillRepo.findFirst({ where: { roleId: role.id, skillId: skillId } });
    if (!roleSkill) return 'Skill not required for this role';

    // Generate explanation based on importance and role context
    let explanation = `${skill.name} is important for a ${role.name} because `;

    switch (skill.name) {
      case 'JavaScript':
        explanation += 'it is the fundamental language for web development, powering both frontend and backend applications.';
        break;
      case 'React':
        explanation += 'it is the leading library for building modern, interactive user interfaces.';
        break;
      case 'Node.js':
        explanation += 'it enables server-side JavaScript development, allowing full-stack development with a single language.';
        break;
      case 'PostgreSQL':
        explanation += 'it is a reliable, open-source relational database commonly used in web applications.';
        break;
      case 'REST APIs':
        explanation += 'they are the standard way for frontend and backend systems to communicate.';
        break;
      case 'Authentication':
        explanation += 'it is essential for securing applications and protecting user data.';
        break;
      case 'Testing':
        explanation += 'it ensures code quality, prevents regressions, and maintains application reliability.';
        break;
      case 'System Design':
        explanation += 'it ensures applications are scalable, maintainable, and meet performance requirements.';
        break;
      case 'Git':
        explanation += 'it is the industry-standard version control system for collaborative development.';
        break;
      case 'Docker':
        explanation += 'it enables consistent deployment across different environments through containerization.';
        break;
      default:
        explanation += 'it is a key competency required for effective performance in this role.';
    }

    if (roleSkill.importance >= 80) {
      explanation += ` This skill is rated as highly important (${roleSkill.importance}/100) for the ${role.name} role.`;
    } else if (roleSkill.importance >= 60) {
      explanation += ` This skill is rated as moderately important (${roleSkill.importance}/100) for the ${role.name} role.`;
    } else {
      explanation += ` This skill is rated as somewhat important (${roleSkill.importance}/100) for the ${role.name} role.`;
    }

    return explanation;
  }
}

export const skillGapService = new SkillGapService();
