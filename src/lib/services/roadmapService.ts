import { 
  getStudentRepository, 
  getCareerGoalRepository, 
  getSkillRepository, 
  getRoleRepository, 
  getRoleSkillRepository, 
  getStudentSkillRepository,
  getEvidenceRepository,
  getProjectRepository,
  getProjectSkillRepository,
  getRoadmapRepository,
  getRoadmapItemRepository,
  getProgressRepository,
} from '../data';
import { skillGapService } from './skillGapService';
import { prioritizationService } from './prioritizationService';
import { projectRecommendationService } from './projectRecommendationService';

export type RoadmapGenerationOptions = {
  weeklyAvailability: number; // Hours per week available for learning
  timelineMonths: number; // Desired timeline in months
  includeProjects: boolean; // Whether to include recommended projects
};

export type GeneratedRoadmapItem = {
  id: string;
  title: string;
  description: string;
  type: 'LEARNING_MODULE' | 'TASK' | 'MILESTONE' | 'PROJECT';
  estimatedEffort: number; // In hours
  order: number;
  dependencies: string[]; // Array of prerequisite item IDs
  resources?: {
    type: string; // 'VIDEO', 'ARTICLE', 'COURSE', 'PROJECT', 'EXERCISE'
    title: string;
    url?: string;
    description?: string;
  }[];
};

export class RoadmapService {
  private studentRepo = getStudentRepository();
  private careerGoalRepo = getCareerGoalRepository();
  private skillRepo = getSkillRepository();
  private roleRepo = getRoleRepository();
  private roleSkillRepo = getRoleSkillRepository();
  private studentSkillRepo = getStudentSkillRepository();
  private evidenceRepo = getEvidenceRepository();
  private projectRepo = getProjectRepository();
  private projectSkillRepo = getProjectSkillRepository();
  private roadmapRepo = getRoadmapRepository();
  private roadmapItemRepo = getRoadmapItemRepository();
  private progressRepo = getProgressRepository();

  async generateRoadmap(studentId: string, options: RoadmapGenerationOptions): Promise<{
    roadmapId: string;
    items: GeneratedRoadmapItem[];
    totalEstimatedHours: number;
    weeklySchedule: Array<{
      week: number;
      hours: number;
      activities: string[];
    }>;
  }> {
    // Get student and career goal
    const student = await this.studentRepo.findUnique({ where: { id: studentId } });
    if (!student) throw new Error(`Student not found: ${studentId}`);

    const careerGoal = await this.careerGoalRepo.findFirst({ where: { studentId: studentId } });
    if (!careerGoal) throw new Error(`Career goal not found for student: ${studentId}`);

    // Get target role
    const role = await this.roleRepo.findFirst({ where: { name: careerGoal.targetRole } });
    if (!role) throw new Error(`Role not found: ${careerGoal.targetRole}`);

    // Get skill gap analysis and prioritization
    const gapAnalysis = await skillGapService.analyzeSkillGaps(studentId);
    const prioritizedSkills = await prioritizationService.prioritizeSkillsForStudent(studentId);

    // Get recommended projects if requested
    let recommendedProjects: any[] = [];
    if (options.includeProjects) {
      recommendedProjects = await projectRecommendationService.recommendProjectsForStudent(studentId, 3);
    }

    // Calculate total available hours
    const totalAvailableHours = options.weeklyAvailability * 4 * options.timelineMonths; // Approx 4 weeks per month
    const hoursForLearning = Math.min(totalAvailableHours, totalAvailableHours * 0.8); // Reserve 20% for buffer/review

    // Generate learning modules for prioritized skills with gaps
    const learningModules: GeneratedRoadmapItem[] = [];
    let currentOrder = 1;

    // Group skills by category or create logical learning paths
    // For simplicity, we'll create modules for each prioritized skill with a deficit
    const skillsWithDeficit = gapAnalysis.skillGaps
      .filter(gap => gap.gap < 0) // Only skills with deficit
      .sort((a, b) => {
        // Sort by priority score from prioritization service
        const prioA = prioritizedSkills.find(p => p.skillId === a.skillId);
        const prioB = prioritizedSkills.find(p => p.skillId === b.skillId);
        const scoreA = prioA ? prioA.priorityScore : 0;
        const scoreB = prioB ? prioB.priorityScore : 0;
        return scoreB - scoreA; // Higher priority first
      });

    // Create learning modules for each skill
    for (const gap of skillsWithDeficit) {
      const skill = await this.skillRepo.findUnique({ where: { id: gap.skillId } });
      if (!skill) continue;

      // Estimate hours needed to close the gap
      const hoursNeeded = Math.abs(gap.gap) * 0.5; // Heuristic: 1 point = 0.5 hours
      const cappedHours = Math.min(hoursNeeded, 20); // Cap at 20 hours per skill to avoid overload

      // Determine prerequisites based on skill dependencies
      const dependencies: string[] = [];
      // For simplicity, we'll add some common prerequisites
      switch (skill.name) {
        case 'React':
          {
            const jsSkill = await this.skillRepo.findFirst({ where: { name: 'JavaScript' } });
            if (jsSkill) dependencies.push(`skill-${jsSkill.id}`);
          }
          break;
        case 'Node.js':
          {
            const jsSkill = await this.skillRepo.findFirst({ where: { name: 'JavaScript' } });
            if (jsSkill) dependencies.push(`skill-${jsSkill.id}`);
          }
          break;
        case 'REST APIs':
          {
            const jsSkill = await this.skillRepo.findFirst({ where: { name: 'JavaScript' } });
            if (jsSkill) dependencies.push(`skill-${jsSkill.id}`);
          }
          break;
        case 'System Design':
          {
            // Dependencies on multiple skills
            const jsSkill = await this.skillRepo.findFirst({ where: { name: 'JavaScript' } });
            const dbSkill = await this.skillRepo.findFirst({ where: { name: 'PostgreSQL' } });
            if (jsSkill) dependencies.push(`skill-${jsSkill.id}`);
            if (dbSkill) dependencies.push(`skill-${dbSkill.id}`);
          }
          break;
      }

      // Generate title and description
      let title = `Learn ${skill.name}`;
      let description = `Develop proficiency in ${skill.name} from ${gap.currentProficiency} to ${gap.requiredProficiency}. `;
      description += gap.explanation;

      // Add resources based on skill type
      const resources: GeneratedRoadmapItem['resources'] = [];
      switch (skill.name) {
        case 'JavaScript':
          resources.push(
            { type: 'COURSE', title: 'JavaScript Basics', url: '#', description: 'Learn JavaScript fundamentals' },
            { type: 'EXERCISE', title: 'JavaScript Practice', url: '#', description: 'Hands-on JavaScript exercises' }
          );
          break;
        case 'React':
          resources.push(
            { type: 'COURSE', title: 'React Fundamentals', url: '#', description: 'Learn React hooks and components' },
            { type: 'PROJECT', title: 'Build a Todo App', url: '#', description: 'Apply React concepts in a project' }
          );
          break;
        case 'Node.js':
          resources.push(
            { type: 'COURSE', title: 'Node.js Essentials', url: '#', description: 'Learn server-side JavaScript' },
            { type: 'PROJECT', title: 'Create a REST API', url: '#', description: 'Build a backend API with Node.js' }
          );
          break;
        case 'PostgreSQL':
          resources.push(
            { type: 'COURSE', title: 'SQL and PostgreSQL', url: '#', description: 'Learn relational databases and SQL' },
            { type: 'PROJECT', title: 'Design a Database Schema', url: '#', description: 'Create a database for a web app' }
          );
          break;
        default:
          resources.push(
            { type: 'ARTICLE', title: `Learn ${skill.name}`, url: '#', description: `Study materials for ${skill.name}` }
          );
      }

      learningModules.push({
        id: `module-${skill.id}`,
        title,
        description,
        type: 'LEARNING_MODULE',
        estimatedEffort: Math.round(cappedHours),
        order: currentOrder++,
        dependencies,
        resources
      });
    }

    // Add project-based learning if requested
    let projectItems: GeneratedRoadmapItem[] = [];
    if (options.includeProjects && recommendedProjects.length > 0) {
      for (const proj of recommendedProjects) {
        projectItems.push({
          id: `project-${proj.projectId}`,
          title: `Build: ${proj.projectName}`,
          description: proj.explanation,
          type: 'PROJECT',
          estimatedEffort: proj.estimatedHours,
          order: currentOrder++,
          dependencies: [], // Projects typically come after learning the skills they use
          resources: [
            { type: 'PROJECT', title: proj.projectName, url: '#', description: proj.projectDescription }
          ]
        });
      }
    }

    // Combine all items: learning modules first, then projects
    const allItems = [...learningModules, ...projectItems];

    // Reorder dependencies to point to actual item IDs
    // For simplicity in this demo, we'll keep dependencies as skill IDs and handle them in UI
    // In a real implementation, we'd map skill dependencies to actual module IDs

    // Calculate weekly schedule
    const totalEstimatedHours = allItems.reduce((sum, item) => sum + item.estimatedEffort, 0);
    const weeks = Math.max(1, Math.ceil(totalEstimatedHours / options.weeklyAvailability));
    const weeklySchedule: Array<{ week: number; hours: number; activities: string[] }> = [];

    let hoursRemaining = totalEstimatedHours;
    let itemIndex = 0;

    for (let week = 1; week <= weeks; week++) {
      const hoursThisWeek = Math.min(options.weeklyAvailability, hoursRemaining);
      hoursRemaining -= hoursThisWeek;

      const activities: string[] = [];
      let hoursUsedThisWeek = 0;

      // Assign items to weeks based on effort
      while (hoursUsedThisWeek < hoursThisWeek && itemIndex < allItems.length) {
        const item = allItems[itemIndex];
        if (item.estimatedEffort <= (hoursThisWeek - hoursUsedThisWeek)) {
          activities.push(`${item.title} (${item.estimatedEffort} hrs)`);
          hoursUsedThisWeek += item.estimatedEffort;
          itemIndex++;
        } else {
          // Split the item across weeks
          const remainingInItem = item.estimatedEffort - (hoursUsedThisWeek > 0 ?
            (item.estimatedEffort - (hoursThisWeek - hoursUsedThisWeek)) : 0);
          if (hoursUsedThisWeek === 0) {
            activities.push(`${item.title} (Part 1, ${hoursThisWeek - hoursUsedThisWeek} hrs)`);
          } else {
            activities.push(`${item.title} (Part ${Math.floor(hoursUsedThisWeek / item.estimatedEffort) + 2}, ${hoursThisWeek - hoursUsedThisWeek} hrs)`);
          }
          hoursUsedThisWeek = hoursThisWeek;
          break;
        }
      }

      weeklySchedule.push({
        week,
        hours: hoursUsedThisWeek,
        activities
      });

      if (hoursRemaining <= 0 && itemIndex >= allItems.length) break;
    }

    // Save or update the roadmap in our data store
    // Check if there's an existing active roadmap for this student
    const existingRoadmap = await this.roadmapRepo.findFirst({
      where: { studentId: student.id, isActive: true }
    });
    let roadmapId: string;

    if (existingRoadmap) {
      // Update existing roadmap
      roadmapId = existingRoadmap.id;
      await this.roadmapRepo.update({
        where: { id: roadmapId },
        data: {
          title: `Learning Plan for ${role.name}`,
          description: `Personalized roadmap to become a ${role.name} based on your current skills and goals`,
          version: existingRoadmap.version + 1,
          updatedAt: new Date()
        }
      });

      // Clear existing items
      const existingItems = await this.roadmapItemRepo.findMany({
        where: { roadmapId: roadmapId }
      });
      for (const item of existingItems) {
        await this.roadmapItemRepo.delete({ where: { id: item.id } });
      }

      // Add new items
      for (const item of allItems) {
        await this.roadmapItemRepo.create({
          data: {
            id: item.id,
            roadmapId,
            title: item.title,
            description: item.description,
            type: item.type,
            estimatedEffort: item.estimatedEffort,
            order: item.order,
            dependencies: JSON.stringify(item.dependencies),
            completed: false,
            completedAt: null
          }
        });
      }
    } else {
      // Create new roadmap
      roadmapId = await this.roadmapRepo.create({
        data: {
          studentId: student.id,
          title: `Learning Plan for ${role.name}`,
          description: `Personalized roadmap to become a ${role.name} based on your current skills and goals`,
          version: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }).then(roadmap => roadmap.id);

      // Add items
      for (const item of allItems) {
        await this.roadmapItemRepo.create({
          data: {
            id: item.id,
            roadmapId: roadmapId,
            title: item.title,
            description: item.description,
            type: item.type,
            estimatedEffort: item.estimatedEffort,
            order: item.order,
            dependencies: JSON.stringify(item.dependencies),
            completed: false,
            completedAt: null
          }
        });
      }
    }

    return {
      roadmapId,
      items: allItems,
      totalEstimatedHours: Math.round(totalEstimatedHours),
      weeklySchedule
    };
  }

  // Update progress on a roadmap item
  async updateItemProgress(studentId: string, itemId: string, completed: boolean, evidenceIds: string[] = []): Promise<boolean> {
    // Get student's active roadmap
    const student = await this.studentRepo.findUnique({ where: { id: studentId } });
    if (!student) return false;

    const careerGoal = await this.careerGoalRepo.findFirst({ where: { studentId: studentId } });
    if (!careerGoal) return false;

    const role = await this.roleRepo.findFirst({ where: { name: careerGoal.targetRole } });
    if (!role) return false;

    const activeRoadmap = await this.roadmapRepo.findFirst({
      where: {
        studentId: studentId,
        isActive: true
      }
    });
    if (!activeRoadmap) return false;

    // Find the item
    const item = await this.roadmapItemRepo.findUnique({ where: { id: itemId } });
    if (!item || item.roadmapId !== activeRoadmap.id) return false;

    // Update the item
    await this.roadmapItemRepo.update({
      where: { id: itemId },
      data: {
        completed,
        completedAt: completed ? new Date() : null
      }
    });

    // Create progress entries for evidence
    if (evidenceIds.length > 0) {
      await this.progressRepo.create({
        data: {
          studentId: student.id,
          roadmapItemId: itemId,
          evidenceIds,
          completedAt: new Date()
        }
      });
    }

    return true;
  }

  // Get suggested roadmap adjustments based on new evidence
  async suggestRoadmapAdjustments(studentId: string): Promise<{
    type: 'ROADMAP_ADJUSTMENT';
    title: string;
    description: string;
    rationale: string;
    confidence: number;
    suggestedChanges: Array<{
      type: 'ADD_ITEM' | 'REMOVE_ITEM' | 'UPDATE_ORDER' | 'UPDATE_EFFORT';
      itemId?: string;
      title?: string;
      description?: string;
      order?: number;
      estimatedEffort?: number;
      rationale: string;
    }>;
  }> {
    // Get student and career goal
    const student = await this.studentRepo.findUnique({ where: { id: studentId } });
    if (!student) throw new Error(`Student not found: ${studentId}`);

    const careerGoal = await this.careerGoalRepo.findFirst({ where: { studentId: studentId } });
    if (!careerGoal) throw new Error(`Career goal not found for student: ${studentId}`);

    // Get target role
    const role = await this.roleRepo.findFirst({ where: { name: careerGoal.targetRole } });
    if (!role) throw new Error(`Role not found: ${careerGoal.targetRole}`);

    // Get current active roadmap
    const activeRoadmap = await this.roadmapRepo.findFirst({
      where: {
        studentId: studentId,
        isActive: true
      }
    });
    if (!activeRoadmap) {
      // No existing roadmap, suggest creating one
      return {
        type: 'ROADMAP_ADJUSTMENT',
        title: 'Create Initial Learning Roadmap',
        description: 'No existing learning roadmap found. Create a personalized roadmap based on your skills and goals.',
        rationale: 'Every student needs a starting point for their learning journey.',
        confidence: 0.9,
        suggestedChanges: [{
          type: 'ADD_ITEM',
          title: `Learning Plan for ${role.name}`,
          description: `Personalized roadmap to become a ${role.name}`,
          order: 1,
          estimatedEffort: 0,
          rationale: 'Create initial roadmap based on skill gap analysis'
        }]
      };
    }

    // Get recent evidence (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentEvidence = await this.evidenceRepo.findMany({
      where: {
        studentId: studentId,
        completedAt: { gte: thirtyDaysAgo }
      }
    });

    if (recentEvidence.length === 0) {
      return {
        type: 'ROADMAP_ADJUSTMENT',
        title: 'No Recent Activity Detected',
        description: 'No learning evidence recorded in the past 30 days. Consider updating your roadmap based on recent progress.',
        rationale: 'Regular evidence tracking helps keep your roadmap accurate and motivating.',
        confidence: 0.8,
        suggestedChanges: [{
          type: 'UPDATE_ORDER',
          itemId: 'review-progress',
          title: 'Review Learning Progress',
          description: 'Assess what you have learned recently and update your goals',
          order: 1,
          estimatedEffort: 2,
          rationale: 'Regular progress review ensures roadmap stays relevant'
        }]
      };
    }

    // Analyze how recent evidence affects skill proficiencies
    // For simplicity, we'll just suggest a general update
    const gapAnalysis = await skillGapService.analyzeSkillGaps(studentId);
    const skillsImproved = gapAnalysis.skillGaps
      .filter(gap => gap.gap < -5) // Skills where gap has improved (become less negative)
      .slice(0, 3); // Top 3 improved skills

    let suggestedChanges: any[] = [];

    if (skillsImproved.length > 0) {
      suggestedChanges.push({
        type: 'UPDATE_ORDER',
        itemId: 'review-completed-skills',
        title: 'Review Recently Improved Skills',
        description: `Consider advancing your learning in: ${skillsImproved.map(s => s.skillName).join(', ')}`,
        order: 1,
        estimatedEffort: 1,
        rationale: 'You have made progress in these skills - consider learning more advanced topics'
      });
    }

    // Check for skills that may need more attention
    const skillsNeedingWork = gapAnalysis.skillGaps
      .filter(gap => gap.gap < -20) // Significant gaps remaining
      .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap)) // Largest gaps first
      .slice(0, 3);

    if (skillsNeedingWork.length > 0) {
      suggestedChanges.push({
        type: 'UPDATE_ORDER',
        itemId: 'focus-on-gaps',
        title: 'Focus on Remaining Skill Gaps',
        description: `Consider dedicating more time to: ${skillsNeedingWork.map(s => s.skillName).join(', ')}`,
        order: 2,
        estimatedEffort: 1,
        rationale: 'These skills still show significant gaps requiring attention'
      });
    }

    // If no specific changes suggested, provide general guidance
    if (suggestedChanges.length === 0) {
      suggestedChanges = [{
        type: 'UPDATE_ORDER',
        itemId: 'continue-learning',
        title: 'Continue Current Learning Path',
        description: 'Your current roadmap appears to be well-aligned with your progress.',
        order: 1,
        estimatedEffort: 1,
        rationale: 'Your skill development is progressing as expected'
      }];
    }

    return {
      type: 'ROADMAP_ADJUSTMENT',
      title: 'Roadmap Update Suggestions',
      description: 'Based on your recent learning evidence, consider these adjustments to your roadmap.',
      rationale: 'Regular roadmap updates ensure your learning path stays aligned with your progress and goals.',
      confidence: 0.85,
      suggestedChanges
    };
  }
}

export const roadmapService = new RoadmapService();
