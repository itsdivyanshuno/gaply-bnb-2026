import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// Types are now imported from Prisma client
export type {
  Student,
  CareerGoal,
  Skill,
  Role,
  RoleSkill,
  StudentSkill,
  Evidence,
  Project,
  ProjectSkill,
  Roadmap,
  RoadmapItem,
  Progress,
  Recommendation,
  Assessment
} from '@prisma/client';

// Prisma client singleton
const adapter = new PrismaBetterSqlite3({
  url: "file:/home/divyansh/bnb/prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

// Repository getters that return Prisma-based repositories
export function getStudentRepository() {
  return prisma.student;
}

export function getCareerGoalRepository() {
  return prisma.careerGoal;
}

export function getSkillRepository() {
  return prisma.skill;
}

export function getRoleRepository() {
  return prisma.role;
}

export function getRoleSkillRepository() {
  return prisma.roleSkill;
}

export function getStudentSkillRepository() {
  return prisma.studentSkill;
}

export function getEvidenceRepository() {
  return prisma.evidence;
}

export function getProjectRepository() {
  return prisma.project;
}

export function getProjectSkillRepository() {
  return prisma.projectSkill;
}

export function getRoadmapRepository() {
  return prisma.roadmap;
}

export function getRoadmapItemRepository() {
  return prisma.roadmapItem;
}

export function getProgressRepository() {
  return prisma.progress;
}

export function getRecommendationRepository() {
  return prisma.recommendation;
}

export function getAssessmentRepository() {
  return prisma.assessment;
}

// Export the prisma instance for direct access if needed
export { prisma };