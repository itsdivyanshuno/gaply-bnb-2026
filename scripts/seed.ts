import { prisma } from '../src/lib/data/store';

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.evidence.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.roadmapItem.deleteMany();
  await prisma.roadmap.deleteMany();
  await prisma.projectSkill.deleteMany();
  await prisma.project.deleteMany();
  await prisma.studentSkill.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.roleSkill.deleteMany();
  await prisma.role.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.careerGoal.deleteMany();
  await prisma.student.deleteMany();

  // Create demo student
  const student = await prisma.student.create({
    data: { id: 'user-1',
      name: 'Demo User',
      email: 'demo@gaply.com',
      education: 'Computer Science',
      degreeBranch: 'Software Engineering',
      year: 3,
      weeklyAvailability: 10
    }
  });

  console.log(`Created student: ${student.id}`);

  // Create career goal
  const careerGoal = await prisma.careerGoal.create({
    data: { id: 'user-1',
      studentId: student.id,
      targetRole: 'Full Stack Developer',
      experienceLevel: 'Intermediate',
      timelineMonths: 6,
      preferredTechnologies: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
      weeklyAvailability: 8
    }
  });

  console.log(`Created career goal: ${careerGoal.id}`);

  // Create skills
  const skillsData = [
    { name: 'JavaScript', description: 'Programming language for web development', category: 'Programming' },
    { name: 'React', description: 'JavaScript library for building user interfaces', category: 'Framework' },
    { name: 'Node.js', description: 'JavaScript runtime for server-side applications', category: 'Backend' },
    { name: 'PostgreSQL', description: 'Open-source relational database', category: 'Database' },
    { name: 'REST APIs', description: 'Design and consume RESTful web services', category: 'Backend' },
    { name: 'Authentication', description: 'Implement user authentication and authorization', category: 'Security' },
    { name: 'Testing', description: 'Write and execute automated tests', category: 'Quality' },
    { name: 'System Design', description: 'Design scalable and maintainable systems', category: 'Architecture' },
    { name: 'Git', description: 'Version control system', category: 'Tools' },
    { name: 'Docker', description: 'Containerization platform', category: 'DevOps' }
  ];

  const skills = await prisma.skill.createMany({
    data: skillsData
  });

  console.log(`Created ${skills.count} skills`);

  // Create roles
  const rolesData = [
    { name: 'Full Stack Developer', description: 'Develops both frontend and backend of web applications' },
    { name: 'Frontend Developer', description: 'Specializes in user interface and client-side logic' },
    { name: 'Backend Developer', description: 'Specializes in server-side logic and databases' },
    { name: 'DevOps Engineer', description: 'Focuses on deployment, infrastructure, and operations' }
  ];

  const roles = await prisma.role.createMany({
    data: rolesData
  });

  console.log(`Created ${roles.count} roles`);

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });