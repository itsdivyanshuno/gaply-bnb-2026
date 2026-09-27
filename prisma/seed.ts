import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});
async function main() {
  console.log('Starting GAPLY demo seed...');

  // DEMO STUDENT
  const passwordHash = await bcrypt.hash('div@9369', 10);

  const student = await prisma.student.upsert({
    where: {
      email: 'divyansh@gaply.app',
    },
    update: {
      name: 'Divyansh',
      passwordHash,
      education: 'B.Tech',
      degreeBranch: 'Information Technology',
      year: 2,
      weeklyAvailability: 15,
    },
    create: {
      name: 'Divyansh',
      email: 'divyansh@gaply.app',
      passwordHash,
      education: 'B.Tech',
      degreeBranch: 'Information Technology',
      year: 2,
      weeklyAvailability: 15,
    },
  });

  console.log('Student ready:', student.name);
  console.log('Student ID:', student.id);

  // CAREER GOAL
  await prisma.careerGoal.upsert({
    where: {
      studentId: student.id,
    },
    update: {
      targetRole: 'Full Stack Developer',
      experienceLevel: 'Intermediate',
      timelineMonths: 6,
      weeklyAvailability: 15,
      preferredTechnologies: [
        'JavaScript',
        'TypeScript',
        'React',
        'Node.js',
        'PostgreSQL',
      ],
    },
    create: {
      studentId: student.id,
      targetRole: 'Full Stack Developer',
      experienceLevel: 'Intermediate',
      timelineMonths: 6,
      weeklyAvailability: 15,
      preferredTechnologies: [
        'JavaScript',
        'TypeScript',
        'React',
        'Node.js',
        'PostgreSQL',
      ],
    },
  });

  console.log('Career goal ready');

  // SKILLS
  const skillData = [
    {
      name: 'JavaScript',
      category: 'Programming',
      description: 'Core programming language for web development.',
    },
    {
      name: 'TypeScript',
      category: 'Programming',
      description: 'Typed superset of JavaScript.',
    },
    {
      name: 'React',
      category: 'Frameworks',
      description: 'Library for building user interfaces.',
    },
    {
      name: 'Node.js',
      category: 'Backend',
      description: 'JavaScript runtime for backend development.',
    },
    {
      name: 'REST APIs',
      category: 'Backend',
      description: 'Design and development of REST APIs.',
    },
    {
      name: 'PostgreSQL',
      category: 'Databases',
      description: 'Relational database system.',
    },
    {
      name: 'Git',
      category: 'Tools',
      description: 'Version control system.',
    },
    {
      name: 'System Design',
      category: 'Architecture',
      description: 'Designing scalable software systems.',
    },
    {
      name: 'HTML & CSS',
      category: 'Frontend',
      description: 'Core web structure and styling technologies.',
    },
    {
      name: 'Testing',
      category: 'Engineering',
      description: 'Software testing practices.',
    },
  ];

  const skills: Record<string, any> = {};

  for (const data of skillData) {
    const skill = await prisma.skill.upsert({
      where: {
        name: data.name,
      },
      update: {
        description: data.description,
        category: data.category,
      },
      create: data,
    });

    skills[data.name] = skill;
  }

  console.log('Skills ready:', skillData.length);

  // ROLE
  const role = await prisma.role.upsert({
    where: {
      name: 'Full Stack Developer',
    },
    update: {
      description:
        'Developer capable of building complete web applications across frontend, backend, APIs and databases.',
    },
    create: {
      name: 'Full Stack Developer',
      description:
        'Developer capable of building complete web applications across frontend, backend, APIs and databases.',
    },
  });

  console.log('Role ready:', role.name);

  // ROLE SKILLS
  const roleRequirements = [
    ['JavaScript', 85, 95],
    ['TypeScript', 75, 80],
    ['React', 80, 90],
    ['Node.js', 80, 90],
    ['REST APIs', 80, 85],
    ['PostgreSQL', 75, 80],
    ['Git', 70, 70],
    ['System Design', 65, 70],
    ['HTML & CSS', 80, 75],
    ['Testing', 65, 60],
  ] as const;

  for (const [skillName, requiredProficiency, importance] of roleRequirements) {
    await prisma.roleSkill.upsert({
      where: {
        roleId_skillId: {
          roleId: role.id,
          skillId: skills[skillName].id,
        },
      },
      update: {
        requiredProficiency,
        importance,
      },
      create: {
        roleId: role.id,
        skillId: skills[skillName].id,
        requiredProficiency,
        importance,
      },
    });
  }

  console.log('Role requirements ready');

  // STUDENT SKILLS
  const studentSkillLevels: Record<string, number> = {
    JavaScript: 68,
    TypeScript: 45,
    React: 58,
    'Node.js': 50,
    'REST APIs': 48,
    PostgreSQL: 42,
    Git: 72,
    'System Design': 30,
    'HTML & CSS': 82,
    Testing: 35,
  };

  for (const [skillName, currentProficiency] of Object.entries(
    studentSkillLevels
  )) {
    await prisma.studentSkill.upsert({
      where: {
        studentId_skillId: {
          studentId: student.id,
          skillId: skills[skillName].id,
        },
      },
      update: {
        currentProficiency,
        confidence: 0.85,
        lastAssessed: new Date(),
      },
      create: {
        studentId: student.id,
        skillId: skills[skillName].id,
        currentProficiency,
        confidence: 0.85,
        lastAssessed: new Date(),
      },
    });
  }

  console.log('Student skills ready');

  // PROJECTS
  const projectData = [
    {
      name: 'Full Stack Task Manager',
      description:
        'Complete task management application with authentication, REST APIs and database.',
      difficulty: 'Intermediate',
      estimatedHours: 25,
      skills: [
        ['JavaScript', 80],
        ['React', 90],
        ['Node.js', 90],
        ['REST APIs', 85],
        ['PostgreSQL', 75],
      ],
    },
    {
      name: 'E-Commerce Platform',
      description:
        'Production-style e-commerce application with products, authentication and orders.',
      difficulty: 'Advanced',
      estimatedHours: 40,
      skills: [
        ['React', 90],
        ['TypeScript', 85],
        ['Node.js', 85],
        ['PostgreSQL', 90],
        ['REST APIs', 85],
      ],
    },
    {
      name: 'Real-Time Collaboration App',
      description:
        'Collaborative application with real-time updates and scalable architecture.',
      difficulty: 'Advanced',
      estimatedHours: 35,
      skills: [
        ['React', 80],
        ['Node.js', 85],
        ['TypeScript', 80],
        ['System Design', 95],
        ['REST APIs', 75],
      ],
    },
    {
      name: 'Developer Portfolio',
      description:
        'Modern developer portfolio showcasing projects and technical skills.',
      difficulty: 'Beginner',
      estimatedHours: 12,
      skills: [
        ['HTML & CSS', 90],
        ['JavaScript', 75],
        ['React', 80],
        ['Git', 60],
      ],
    },
    {
      name: 'REST API Service',
      description:
        'Production-style REST API with authentication, testing and PostgreSQL.',
      difficulty: 'Intermediate',
      estimatedHours: 20,
      skills: [
        ['Node.js', 90],
        ['REST APIs', 100],
        ['PostgreSQL', 85],
        ['Testing', 70],
        ['Git', 60],
      ],
    },
  ];

  for (const data of projectData) {
    let project = await prisma.project.findFirst({
      where: {
        name: data.name,
      },
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          name: data.name,
          description: data.description,
          difficulty: data.difficulty,
          estimatedHours: data.estimatedHours,
        },
      });
    }

    await prisma.project.update({
      where: {
        id: project.id,
      },
      data: {
        description: data.description,
        difficulty: data.difficulty,
        estimatedHours: data.estimatedHours,
      },
    });

    for (const [skillName, relevance] of data.skills) {
      await prisma.projectSkill.upsert({
        where: {
          projectId_skillId: {
            projectId: project.id,
            skillId: skills[skillName].id,
          },
        },
        update: {
          relevance: Number(relevance),
        },
        create: {
          projectId: project.id,
          skillId: skills[skillName].id,
          relevance: Number(relevance),
        },
      });
    }
  }

  console.log('Projects ready:', projectData.length);

  // EVIDENCE
  const evidenceCount = await prisma.evidence.count({
    where: {
      studentId: student.id,
    },
  });

  if (evidenceCount === 0) {
    await prisma.evidence.createMany({
      data: [
        {
          studentId: student.id,
          type: 'PROJECT',
          title: 'HBTU ScoreCard',
          description:
            'Student result analysis platform built using React and Firebase.',
          url: 'https://hbtu-scorecard.vercel.app/',
          relatedSkills: [
            skills.JavaScript.id,
            skills.React.id,
          ],
          score: 82,
          completedAt: new Date('2026-08-20'),
        },
        {
          studentId: student.id,
          type: 'PROJECT',
          title: 'GAPLY',
          description:
            'Personalized career-readiness platform with skill-gap analysis and roadmap generation.',
          url: 'https://github.com/itsdivyanshuno/gaply-bnb-2026',
          relatedSkills: [
            skills.JavaScript.id,
            skills.React.id,
            skills['Node.js'].id,
            skills.PostgreSQL.id,
          ],
          score: 88,
          completedAt: new Date('2026-09-20'),
        },
        {
          studentId: student.id,
          type: 'SELF_ASSESSMENT',
          title: 'Full Stack Development Assessment',
          description:
            'Assessment covering frontend, backend, APIs and databases.',
          relatedSkills: [
            skills.React.id,
            skills['Node.js'].id,
            skills.PostgreSQL.id,
          ],
          score: 72,
          completedAt: new Date('2026-09-22'),
        },
      ],
    });
  }

  console.log('Evidence ready');

  // ASSESSMENTS
  const assessmentSkills = [
    ['JavaScript', 72],
    ['React', 65],
    ['Node.js', 58],
    ['PostgreSQL', 52],
    ['REST APIs', 55],
  ] as const;

  for (const [skillName, score] of assessmentSkills) {
    const existing = await prisma.assessment.findFirst({
      where: {
        studentId: student.id,
        skillId: skills[skillName].id,
        type: 'SELF_ASSESSMENT',
      },
    });

    if (!existing) {
      await prisma.assessment.create({
        data: {
          studentId: student.id,
          skillId: skills[skillName].id,
          score,
          type: 'SELF_ASSESSMENT',
          notes: `Assessment for ${skillName}`,
        },
      });
    }
  }

  console.log('Assessments ready');

  // RECOMMENDATIONS
  const recommendations = [
    {
      type: 'SKILL_PRIORITY',
      title: 'Strengthen System Design',
      description:
        'System Design currently has one of the largest gaps for your target role.',
      rationale:
        'Current proficiency is significantly below the required level for Full Stack Developer.',
      confidence: 0.91,
    },
    {
      type: 'SKILL_PRIORITY',
      title: 'Improve PostgreSQL',
      description:
        'Database proficiency is important for building production-ready backend systems.',
      rationale:
        'PostgreSQL proficiency is below the target requirement for the selected role.',
      confidence: 0.88,
    },
    {
      type: 'PROJECT_RECOMMENDATION',
      title: 'Build a REST API Service',
      description:
        'This project develops backend, API, database and testing skills.',
      rationale:
        'The project covers several skills where current proficiency is below role requirements.',
      confidence: 0.9,
    },
  ];

  for (const recommendation of recommendations) {
    const existing = await prisma.recommendation.findFirst({
      where: {
        studentId: student.id,
        title: recommendation.title,
      },
    });

    if (!existing) {
      await prisma.recommendation.create({
        data: {
          studentId: student.id,
          type: recommendation.type,
          title: recommendation.title,
          description: recommendation.description,
          rationale: recommendation.rationale,
          confidence: recommendation.confidence,
          sourceData: {
            role: role.name,
            generatedFor: 'demo',
          },
        },
      });
    }
  }

  console.log('Recommendations ready');

  // ROADMAP
  let roadmap = await prisma.roadmap.findFirst({
    where: {
      studentId: student.id,
      isActive: true,
    },
  });

  if (!roadmap) {
    roadmap = await prisma.roadmap.create({
      data: {
        studentId: student.id,
        title: 'Full Stack Developer Roadmap',
        description:
          'Personalized six-month learning roadmap based on current skills and career goals.',
        version: 1,
        isActive: true,
      },
    });
  }

  const roadmapItemCount = await prisma.roadmapItem.count({
    where: {
      roadmapId: roadmap.id,
    },
  });

  if (roadmapItemCount === 0) {
    const roadmapItems = [
      {
        title: 'Strengthen JavaScript Fundamentals',
        description:
          'Improve asynchronous JavaScript, advanced functions, modules and modern language features.',
        type: 'LEARNING_MODULE',
        estimatedEffort: 12,
        order: 1,
        completed: true,
      },
      {
        title: 'Master React Development',
        description:
          'Work on component architecture, hooks, state management and performance.',
        type: 'LEARNING_MODULE',
        estimatedEffort: 16,
        order: 2,
        completed: true,
      },
      {
        title: 'Build a REST API',
        description:
          'Create a Node.js backend with authentication, validation and PostgreSQL.',
        type: 'PROJECT',
        estimatedEffort: 20,
        order: 3,
        completed: false,
      },
      {
        title: 'PostgreSQL & Database Design',
        description:
          'Practice relational modelling, queries, indexes and database optimization.',
        type: 'LEARNING_MODULE',
        estimatedEffort: 14,
        order: 4,
        completed: false,
      },
      {
        title: 'TypeScript for Full Stack Apps',
        description:
          'Use strongly typed TypeScript across frontend and backend applications.',
        type: 'LEARNING_MODULE',
        estimatedEffort: 15,
        order: 5,
        completed: false,
      },
      {
        title: 'System Design Fundamentals',
        description:
          'Learn scalability, caching, load balancing, APIs and service architecture.',
        type: 'LEARNING_MODULE',
        estimatedEffort: 18,
        order: 6,
        completed: false,
      },
      {
        title: 'Build a Full Stack Application',
        description:
          'Combine frontend, backend, database and authentication into a complete application.',
        type: 'PROJECT',
        estimatedEffort: 30,
        order: 7,
        completed: false,
      },
      {
        title: 'Full Stack Readiness Milestone',
        description:
          'Review skill gaps and validate readiness for the target Full Stack Developer role.',
        type: 'MILESTONE',
        estimatedEffort: 5,
        order: 8,
        completed: false,
      },
    ];

    for (const item of roadmapItems) {
      await prisma.roadmapItem.create({
        data: {
          roadmapId: roadmap.id,
          title: item.title,
          description: item.description,
          type: item.type,
          estimatedEffort: item.estimatedEffort,
          order: item.order,
          completed: item.completed,
          completedAt: item.completed ? new Date() : null,
        },
      });
    }
  }

  console.log('Roadmap ready');

  // PROGRESS
  const activeRoadmap = await prisma.roadmap.findFirst({
    where: {
      studentId: student.id,
      isActive: true,
    },
    include: {
      roadmapItems: true,
    },
  });

  if (activeRoadmap) {
    for (const item of activeRoadmap.roadmapItems) {
      if (!item.completed) {
        continue;
      }

      await prisma.progress.upsert({
        where: {
          studentId_roadmapItemId: {
            studentId: student.id,
            roadmapItemId: item.id,
          },
        },
        update: {
          completedAt: item.completedAt ?? new Date(),
        },
        create: {
          studentId: student.id,
          roadmapItemId: item.id,
          evidenceIds: [],
          completedAt: item.completedAt ?? new Date(),
        },
      });
    }
  }

  console.log('Progress ready');

  // FINAL OUTPUT
  console.log('');
  console.log('==========================================');
  console.log('GAPLY DEMO DATA READY');
  console.log('==========================================');
  console.log('');
  console.log('Name:     Divyansh');
  console.log('Email:    divyansh@gaply.app');
  console.log('Password: div@9369');
  console.log('');
  console.log('Student ID:', student.id);
  console.log('');
  console.log('==========================================');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
