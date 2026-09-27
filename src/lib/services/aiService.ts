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
import { prioritizationService } from './prioritizationService';
import { projectRecommendationService } from './projectRecommendationService';
import { roadmapService } from './roadmapService';
import { progressService } from './progressService';

export type AIInsight = {
  type: 'SKILL_GAP_EXPLANATION' | 'LEARNING_PATH_SUGGESTION' | 'PROJECT_RECOMMENDATION_ENHANCEMENT' | 'ROADMAP_OPTIMIZATION' | 'CAREER_ADVICE';
  title: string;
  description: string;
  confidence: number; // 0-1
  supportingData: any; // Data that supports this insight
  suggestions: string[]; // Actionable suggestions
};

export class AIService {
  // In a real implementation, this would initialize the AI client
  // For example: private aiClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  private studentRepo = getStudentRepository();
  private careerGoalRepo = getCareerGoalRepository();
  private skillRepo = getSkillRepository();
  private roleRepo = getRoleRepository();
  private roleSkillRepo = getRoleSkillRepository();
  private studentSkillRepo = getStudentSkillRepository();
  private evidenceRepo = getEvidenceRepository();
  private projectRepo = getProjectRepository();
  private projectSkillRepo = getProjectSkillRepository();

  // Generate an AI-enhanced explanation for a skill gap
  async explainSkillGap(studentId: string, skillId: string): Promise<AIInsight> {
    // Get the standard explanation first
    const standardExplanation = await skillGapService.getSkillImportanceExplanation(studentId, skillId);

    // Get student and context
    const student = await this.studentRepo.findUnique({ where: { id: studentId } });
    if (!student) throw new Error(`Student not found: ${studentId}`);

    const careerGoal = await this.careerGoalRepo.findFirst({ where: { studentId: studentId } });
    if (!careerGoal) throw new Error(`Career goal not found`);

    const skill = await this.skillRepo.findUnique({ where: { id: skillId } });
    if (!skill) throw new Error(`Skill not found: ${skillId}`);

    // Get role
    const role = await this.roleRepo.findFirst({ where: { name: careerGoal.targetRole } });
    if (!role) throw new Error(`Role not found: ${careerGoal.targetRole}`);

    // Get student's current level
    const studentSkill = await this.studentSkillRepo.findFirst({ where: { studentId: studentId, skillId: skillId } });
    const currentProficiency = studentSkill ? studentSkill.currentProficiency : 0;

    // Get role requirement
    const roleSkill = await this.roleSkillRepo.findFirst({ where: { roleId: role.id, skillId: skillId } });
    const requiredProficiency = roleSkill ? roleSkill.requiredProficiency : 0;

    // Get recent evidence for this skill
    const allEvidence = await this.evidenceRepo.findMany({ where: { studentId: studentId } });
    const recentEvidence = allEvidence.filter(evidence =>
      Array.isArray(evidence.relatedSkills) && evidence.relatedSkills.includes(skillId) &&
      evidence.completedAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    );

    // Generate AI-enhanced explanation
    let enhancedExplanation = `Based on your learning profile and recent activities, here's a deeper insight into why ${skill.name} is important for your goal of becoming a ${role.name}: `;

    // Add contextual insights based on the data
    const insights = [];

    if (studentSkill && studentSkill.confidence < 0.6) {
      insights.push(`Your current assessment of ${skill.name} has low confidence (${Math.round(studentSkill.confidence * 100)}%). Consider gathering more evidence through projects or exercises to get a more accurate measurement.`);
    }

    if (recentEvidence.length === 0) {
      insights.push(`You haven't recorded any recent learning evidence for ${skill.name} in the past month. Engaging with hands-on projects or structured learning could help build proficiency.`);
    } else {
      insights.push(`You have ${recentEvidence.length} recent evidence items related to ${skill.name}, which shows active engagement with this skill.`);
    }

    // Add career context
    switch (skill.name) {
      case 'JavaScript':
        insights.push(`JavaScript is essential for ${role.name} roles because it's the only language that runs natively in web browsers, making it indispensable for frontend development. Additionally, with Node.js, it enables full-stack development using a single language.`);
        break;
      case 'React':
        insights.push(`React is widely adopted in industry for building scalable user interfaces. Its component-based architecture and virtual DOM make it efficient for creating complex, interactive applications that ${role.name} positions often require.`);
        break;
      case 'Node.js':
        insights.push(`Node.js allows ${role.name} developers to use JavaScript on both frontend and backend, reducing context switching and enabling code reuse. Its non-blocking I/O model is particularly efficient for handling multiple concurrent requests.`);
        break;
      case 'PostgreSQL':
        insights.push(`PostgreSQL is a robust, open-source relational database that offers advanced features like JSON support, full-text search, and strong consistency - all valuable for ${role.name} applications that need reliable data storage.`);
        break;
      default:
        insights.push(`This skill is consistently mentioned in job descriptions for ${role.name} positions and represents a valuable competency in the current job market.`);
    }

    // Add learning pathway suggestion
    const gap = requiredProficiency - (studentSkill ? studentSkill.currentProficiency : 0);
    if (gap > 0) {
      insights.push(`To close your ${gap}-point gap in ${skill.name}, consider a balanced approach of theoretical learning (30%) and hands-on project work (70%).`);
    }

    enhancedExplanation += insights.join(' ') + `. `;
    enhancedExplanation += `The standard assessment indicates: ${standardExplanation}`;

    return {
      type: 'SKILL_GAP_EXPLANATION',
      title: `Why ${skill.name} Matters for Your ${role.name} Goal`,
      description: enhancedExplanation,
      confidence: 0.85, // AI confidence in this insight
      supportingData: {
        studentProficiency: studentSkill ? studentSkill.currentProficiency : 0,
        targetProficiency: requiredProficiency,
        gap: requiredProficiency - (studentSkill ? studentSkill.currentProficiency : 0),
        confidence: studentSkill ? studentSkill.confidence : 0.5,
        recentEvidenceCount: recentEvidence.length,
        studentName: student.name
      },
      suggestions: [
        `Create a small project that demonstrates ${skill.name} proficiency`,
        `Complete an online course or certification in ${skill.name}`,
        `Contribute to an open-source project that uses ${skill.name}`,
        `Pair program with someone experienced in ${skill.name}`
      ]
    };
  }

  // Generate personalized learning path suggestions
  async suggestLearningPath(studentId: string): Promise<AIInsight> {
    const student = await this.studentRepo.findUnique({ where: { id: studentId } });
    if (!student) throw new Error(`Student not found: ${studentId}`);

    const careerGoal = await this.careerGoalRepo.findFirst({ where: { studentId: studentId } });
    if (!careerGoal) throw new Error(`Career goal not found`);

    const gapAnalysis = await skillGapService.analyzeSkillGaps(studentId);
    const prioritizedSkills = await prioritizationService.prioritizeSkillsForStudent(studentId);

    // Generate AI-inspired learning path
    let description = `Based on your current skills, goals, and learning patterns, here's a personalized learning path recommendation: `;

    const insights = [];

    // Analyze learning velocity if we have historical data
    // For now, we'll make reasonable assumptions

    insights.push(`Your learning journey should focus on building foundational competencies before advancing to specialized topics.`);

    if (prioritizedSkills.length > 0) {
      const topSkill = prioritizedSkills[0];
      const skillName = topSkill.skillName;
      insights.push(`Start with ${skillName} as it represents your highest priority skill gap.`);
    }

    insights.push(`Consider a "learn by building" approach where each new concept is immediately applied in a small project.`);
    insights.push(`Schedule regular review sessions to reinforce learning and identify gaps early.`);

    description += insights.join(' ');

    return {
      type: 'LEARNING_PATH_SUGGESTION',
      title: 'Your Personalized Learning Path',
      description,
      confidence: 0.8,
      supportingData: {
        totalSkillsAssessed: gapAnalysis.skillGaps.length,
        skillsWithDeficit: gapAnalysis.skillGaps.filter(g => g.gap < 0).length,
        overallReadiness: gapAnalysis.overallReadiness,
        top3Priorities: prioritizedSkills.slice(0, 3).map(p => p.skillName)
      },
      suggestions: [
        `Set weekly learning goals based on your available time`,
        `Build a portfolio project that combines your top 3 priority skills`,
        `Seek feedback on your work from mentors or peers`,
        `Reflect on your learning progress every two weeks`
      ]
    };
  }

  // Enhance project recommendations with AI insights
  async enhanceProjectRecommendation(studentId: string, projectId: string): Promise<AIInsight> {
    const student = await this.studentRepo.findUnique({ where: { id: studentId } });
    if (!student) throw new Error(`Student not found: ${studentId}`);

    const careerGoal = await this.careerGoalRepo.findFirst({ where: { studentId: studentId } });
    if (!careerGoal) throw new Error(`Career goal not found`);

    const project = await this.projectRepo.findUnique({ where: { id: projectId } });
    if (!project) throw new Error(`Project not found: ${projectId}`);

    const role = await this.roleRepo.findFirst({ where: { name: careerGoal.targetRole } });
    if (!role) throw new Error(`Role not found: ${careerGoal.targetRole}`);

    // Get the standard recommendation
    const standardRec = await projectRecommendationService.recommendProjectsForStudent(studentId, 1);
    const matchingProject = standardRec.find(p => p.projectId === projectId);

    if (!matchingProject) {
      throw new Error(`No recommendation found for project ${projectId}`);
    }

    let description = `AI analysis suggests that ${project.name} is particularly valuable for your development because: `;

    const insights = [];

    insights.push(`This project combines multiple skills in a realistic context, which helps build integrative abilities that employers value.`);

    if (matchingProject.addressedSkills.length >= 3) {
      insights.push(`By addressing ${matchingProject.addressedSkills.length} different skill areas, this project helps you develop the versatility needed for ${role.name} positions.`);
    }

    // Add specific insights based on the project type
    switch (project.name.toLowerCase()) {
      case 'expense tracking app':
        insights.push(`Building an expense tracker will give you practical experience with data validation, state management, and persistent storage - all key competencies for full-stack development.`);
        break;
      case 'social media dashboard':
        insights.push(`Creating a social media dashboard involves API integration, real-time updates, and data visualization - skills that are highly sought after in modern web development roles.`);
        break;
      case 'online learning platform':
        insights.push(`Developing an online learning platform combines complex state management, user authentication, video handling, and payment processing - representing a comprehensive full-stack challenge.`);
        break;
      default:
        insights.push(`This project provides a comprehensive learning experience that touches on frontend, backend, and database concepts.`);
    }

    // Add market relevance insight
    insights.push(`Projects like this are frequently mentioned in job descriptions and technical interviews for ${role.name} positions.`);

    description += insights.join(' ');

    return {
      type: 'PROJECT_RECOMMENDATION_ENHANCEMENT',
      title: `Why ${project.name} is Ideal for Your Development`,
      description,
      confidence: 0.88,
      supportingData: {
        projectName: project.name,
        coverageScore: matchingProject.coverageScore,
        skillsAddressed: matchingProject.addressedSkills.length,
        estimatedHours: matchingProject.estimatedHours,
        difficulty: matchingProject.difficulty
      },
      suggestions: [
        `Start with a minimal viable product (MVP) before adding advanced features`,
        `Document your development process for your portfolio`,
        `Consider adding unit tests to demonstrate quality practices`,
        `Deploy your project to a free hosting service to showcase it`
      ]
    };
  }

  // Generate roadmap optimization suggestions
  async optimizeRoadmap(studentId: string): Promise<AIInsight> {
    const student = await this.studentRepo.findUnique({ where: { id: studentId } });
    if (!student) throw new Error(`Student not found: ${studentId}`);

    const roadmapSuggestions = await roadmapService.suggestRoadmapAdjustments(studentId);

    return {
      type: 'ROADMAP_OPTIMIZATION',
      title: 'AI-Optimized Learning Roadmap',
      description: roadmapSuggestions.description,
      confidence: roadmapSuggestions.confidence,
      supportingData: roadmapSuggestions.suggestedChanges,
      suggestions: roadmapSuggestions.suggestedChanges.map(change => change.title).filter((title): title is string => Boolean(title))
    };
  }

  // Provide general career advice based on student profile
  async getCareerAdvice(studentId: string): Promise<AIInsight> {
    const student = await this.studentRepo.findUnique({ where: { id: studentId } });
    if (!student) throw new Error(`Student not found: ${studentId}`);

    const careerGoal = await this.careerGoalRepo.findFirst({ where: { studentId: studentId } });
    if (!careerGoal) throw new Error(`Career goal not found`);

    const gapAnalysis = await skillGapService.analyzeSkillGaps(studentId);

    let description = `Based on your current profile and goals, here are some career development insights: `;

    const insights = [];

    insights.push(`Your goal of becoming a ${careerGoal.targetRole} is achievable with focused skill development.`);

    if (gapAnalysis.overallReadiness >= 70) {
      insights.push(`You're already quite close to your target! Focus on polishing your strongest skills and gaining practical experience through projects.`);
    } else if (gapAnalysis.overallReadiness >= 40) {
      insights.push(`You have a solid foundation to build upon. Concentrated effort on your priority skills will yield significant progress.`);
    } else {
      insights.push(`You're at the beginning of your journey, which means every skill you learn will be valuable progress toward your goal.`);
    }

    // Add market insights
    insights.push(`The ${careerGoal.targetRole} role continues to be in high demand, with competitive salaries and opportunities for remote work.`);
    insights.push(`Employers value candidates who can demonstrate their skills through projects, not just list them on a resume.`);

    // Add development advice
    insights.push(`Consider specializing in a niche area (like e-commerce, healthcare, or education technology) to stand out in the job market.`);
    insights.push(`Networking and contributing to open-source projects can significantly accelerate your career growth.`);

    description += insights.join(' ');

    return {
      type: 'CAREER_ADVICE',
      title: `Career Development Advice for Aspiring ${careerGoal.targetRole}s`,
      description,
      confidence: 0.82,
      supportingData: {
        overallReadiness: gapAnalysis.overallReadiness,
        skillGapCount: gapAnalysis.skillGaps.length,
        deficitSkillCount: gapAnalysis.skillGaps.filter(g => g.gap < 0).length,
        targetRole: careerGoal.targetRole,
        timelineMonths: careerGoal.timelineMonths
      },
      suggestions: [
        `Build 2-3 portfolio projects that showcase your abilities`,
        `Learn the basics of DevOps and deployment practices`,
        `Practice technical interviewing with coding challenges`,
        `Consider getting a mentor in your target field`,
        `Stay current with industry trends through blogs and newsletters`
      ]
    };
  }
}

export const aiService = new AIService();
