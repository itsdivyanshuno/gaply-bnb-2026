# GAPLY Project Analysis and Recommendations

## A. Current Repository Analysis

The repository currently contains a basic Next.js 16.3.6 application bootstrapped with `create-next-app` using the App Router, TypeScript, and Tailwind CSS 4.

**What we have:**
- Next.js 16.3.6 (App Router)
- React 19.2.8
- React DOM 19.2.8
- Tailwind CSS 4 (via @tailwindcss/postcss)
- TypeScript 5
- ESLint 9 with Next.js config
- Basic folder structure:
  - `src/app/` - App Router directory with layout.tsx, page.tsx, globals.css, favicon.ico
  - `public/` - Static assets directory
  - Configuration files: package.json, tsconfig.json, next.config.ts, eslint.config.mjs, postcss.config.mjs
  - Git repository initialized

**What we don't have:**
- Any domain-specific code for GAPLY
- Database setup
- Authentication system
- AI integration
- Components beyond the basic Next.js starter page
- Any implementation of the core features (student profile, skill gap analysis, etc.)

The repository is essentially a clean Next.js TypeScript/Tailwind starter, which gives us a solid foundation to build upon.

## B. Proposed Architecture

We propose a layered architecture that separates concerns as outlined in the project requirements:

### 1. Presentation Layer (UI)
- **Location**: `src/app/` (Next.js App Router)
- **Technology**: React 19, TypeScript, Tailwind CSS
- **Responsibility**: Rendering UI components, handling user interactions, displaying data
- **Patterns**: 
  - Server Components for data fetching and static content
  - Client Components for interactivity
  - Reusable component library in `src/components/`

### 2. Application Layer
- **Location**: `src/app/api/` (Next.js API Routes) or Server Actions
- **Technology**: Next.js API Routes or Server Actions
- **Responsibility**: 
  - Handling HTTP requests/responses
  - Form submissions and data mutations
  - Authentication endpoints
  - Proxying to external APIs (GitHub, etc.)

### 3. Domain/Business Logic Layer
- **Location**: `src/lib/services/` 
- **Technology**: Plain TypeScript classes/functions
- **Responsibility**:
  - Skill gap calculation algorithms
  - Skill prioritization logic
  - Project recommendation engine
  - Roadmap generation
  - Progress tracking and evidence processing
  - Validation of business rules
- **Key Principle**: This layer should be framework-agnostic and easily testable

### 4. Data Access Layer
- **Location**: `src/lib/db/` (Prisma client and repositories)
- **Technology**: Prisma ORM
- **Responsibility**:
  - Database schema and migrations
  - Data access patterns
  - Transaction management
  - Query optimization

### 5. AI/Agent Layer
- **Location**: `src/lib/ai/`
- **Technology**: TypeScript wrappers around AI APIs (Anthropic Claude, etc.)
- **Responsibility**:
  - Preparing data for AI consumption
  - Calling AI APIs with appropriate prompts
  - Interpreting and validating AI responses
  - Providing tool/function calling capabilities for AI to interact with our data
- **Key Principle**: AI should augment, not replace, deterministic business logic

### 6. Infrastructure Layer
- **Location**: `src/lib/infrastructure/`
- **Technology**: Configuration, external service clients
- **Responsibility**:
  - Database connection
  - Authentication (NextAuth.js)
  - External API clients (GitHub, etc.)
  - Environment variable management
  - Error handling and logging

## C. Proposed Database Model

Based on the project requirements, we propose the following normalized schema using Prisma:

### Core Entities

```prisma
// Student Profile
model Student {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  emailVerified DateTime?
  image         String?
  // Profile fields from requirements
  education     String?
  degreeBranch  String?
  year          Int?
  weeklyAvailability Int? // hours per week available for learning
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  careerGoal    CareerGoal?
  studentSkills StudentSkill[]
  evidence      Evidence[]
  roadmaps      Roadmap[]
  assessments   Assessment[]
  recommendations Recommendation[]
}

// Career Goal
model CareerGoal {
  id            String   @id @default(cuid())
  studentId     String   @unique
  student       Student  @relation(fields: [studentId], references: [id])
  targetRole    String
  experienceLevel String? // Beginner, Intermediate, Advanced
  timelineMonths Int?     // Desired timeline in months
  preferredTechnologies String[] // Array of strings
  weeklyAvailability Int? // Hours per week for learning
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Skill Catalog
model Skill {
  id            String   @id @default(cuid())
  name          String   @unique
  description   String?
  category      String?  // e.g., Programming, Frameworks, Databases, Soft Skills
  createdAt     DateTime @default(now())
  
  // Relations
  roleSkills    RoleSkill[]
  studentSkills StudentSkill[]
  assessments   Assessment[]
  projectSkills ProjectSkill[]
}

// Role Definition
model Role {
  id            String   @id @default(cuid())
  name          String   @unique
  description   String?
  createdAt     DateTime @default(now())
  
  // Relations
  roleSkills    RoleSkill[]
}

// Junction: Role-Skill Requirements
model RoleSkill {
  id            String   @id @default(cuid())
  roleId        String
  role          Role     @relation(fields: [roleId], references: [id])
  skillId       String
  skill         Skill    @relation(fields: [skillId], references: [id])
  requiredProficiency Int   // 0-100 scale
  importance    Int      // 0-100 scale (how critical for the role)
  // Dependencies could be modeled separately if needed
  
  @@unique([roleId, skillId])
}

// Student's Skill Assessment
model StudentSkill {
  id            String   @id @default(cuid())
  studentId     String
  student       Student  @relation(fields: [studentId], references: [id])
  skillId       String
  skill         Skill    @relation(fields: [skillId], references: [id])
  currentProficiency Int   // 0-100 (assessed level)
  confidence    Float    // 0-1 (confidence in assessment)
  lastAssessed  DateTime @default(now())
  // Evidence references could be stored here or in separate Evidence table
  
  @@unique([studentId, skillId])
}

// Evidence of Learning/Progress
model Evidence {
  id            String   @id @default(cuid())
  studentId     String
  student       Student  @relation(fields: [studentId], references: [id])
  type          String   // PROJECT, QUIZ, GITHUB_REPO, CERTIFICATION, SELF_ASSESSMENT, etc.
  title         String
  description   String?
  url           String?  // Link to evidence (GitHub repo, certificate, etc.)
  relatedSkills String[] // Array of skill IDs this evidence demonstrates
  score         Int?     // Score if applicable (0-100)
  completedAt   DateTime
  createdAt     DateTime @default(now())
  
  @@index([studentId, type])
}

// Learning/Project Recommendations
model Project {
  id            String   @id @default(cuid())
  name          String
  description   String?
  difficulty    String?  // Beginner, Intermediate, Advanced
  estimatedHours Int?     // Estimated completion time
  createdAt     DateTime @default(now())
  
  // Relations
  projectSkills ProjectSkill[]
}

// Junction: Project-Skill Mapping
model ProjectSkill {
  id            String   @id @default(cuid())
  projectId     String
  project       Project  @relation(fields: [projectId], references: [id])
  skillId       String
  skill         Skill    @relation(fields: [skillId], references: [id])
  relevance     Int      // 0-100 (how much this project develops the skill)
  
  @@unique([projectId, skillId])
}

// Personalized Learning Roadmap
model Roadmap {
  id            String   @id @default(cuid())
  studentId     String
  student       Student  @relation(fields: [studentId], references: [id])
  title         String   // e.g., "Full Stack Developer Roadmap"
  description   String?
  version       Int      @default(1) // For tracking iterations
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  roadmapItems  RoadmapItem[]
}

// Roadmap Items (Learning Modules, Tasks, Milestones, Projects)
model RoadmapItem {
  id            String   @id @default(cuid())
  roadmapId     String
  roadmap       Roadmap  @relation(fields: [roadmapId], references: [id])
  title         String
  description   String?
  type          String   // LEARNING_MODULE, TASK, MILESTONE, PROJECT
  estimatedEffort Int   // In hours
  order         Int      // Sequence in roadmap
  dependencies  String[] // Array of prerequisite roadmap item IDs
  // Resources could be links to external content
  completed     Boolean  @default(false)
  completedAt   DateTime?
  
  @@index([roadmapId, order])
}

// Progress Tracking
model Progress {
  id            String   @id @default(cuid())
  studentId     String
  student       Student  @relation(fields: [studentId], references: [id])
  roadmapItemId String
  roadmapItem   RoadmapItem @relation(fields: [roadmapItemId], references: [id])
  evidenceIds   String[] // Array of evidence IDs demonstrating completion
  completedAt   DateTime @default(now())
  
  @@unique([studentId, roadmapItemId])
}

// AI-Generated Recommendations
model Recommendation {
  id            String   @id @default(cuid())
  studentId     String
  student       Student  @relation(fields: [studentId], references: [id])
  type          String   // SKILL_PRIORITY, PROJECT_RECOMMENDATION, ROADMAP_ADJUSTMENT, etc.
  title         String
  description   String?
  rationale     String   // Explainability - why this recommendation was made
  confidence    Float    // 0-1 (confidence in recommendation)
  sourceData    Json?    // Optional: data used to generate this recommendation
  isAccepted    Boolean? // null=pending, true=accepted, false=rejected
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([studentId, type])
}

// Assessment Records (Quizzes, Tests, etc.)
model Assessment {
  id            String   @id @default(cuid())
  studentId     String
  student       Student  @relation(fields: [studentId], references: [id])
  skillId       String
  skill         Skill    @relation(fields: [skillId], references: [id])
  score         Int      // 0-100
  type          String   // SELF_ASSESSMENT, QUIZ, EXTERNAL_TEST, etc.
  conductedAt   DateTime @default(now())
  notes         String?
  
  @@index([studentId, skillId])
}
```

### Key Design Decisions:
1. **Separation of Concerns**: Clear separation between student profile, career goals, skills, and assessments
2. **Evidence-Based**: Evidence table tracks proof of learning that influences skill assessments
3. **Flexible Relationships**: Many-to-many relationships between students/skills, roles/skills, projects/skills
4. **Versioning**: Roadmaps include version tracking for historical comparison
5. **Explainability**: Recommendations include rationale field for transparency
6. **Extensibility**: JSON fields for flexible data storage where needed
7. **Auditability**: Created/updated timestamps on all entities

## D. Proposed Folder Structure

```
gaply-bnb-2026/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Authentication routes (sign-in, sign-out, etc.)
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx        # Dashboard overview
│   │   │   ├── profile/        # Student profile pages
│   │   │   │   ├── page.tsx    # Profile view/edit
│   │   │   │   └── components/ # Profile-specific components
│   │   │   ├── career-goal/    # Career goal setting
│   │   │   ├── skills/         # Skill assessment and gap analysis
│   │   │   ├── roadmap/        # Personalized roadmap views
│   │   │   └── projects/       # Project recommendations
│   │   ├── api/                # Next.js API Routes
│   │   │   ├── auth/           # Auth endpoints (NextAuth)
│   │   │   ├── students/       # Student CRUD operations
│   │   │   ├── skills/         # Skill-related endpoints
│   │   │   ├── roadmap/        # Roadmap operations
│   │   │   └── recommendations/# AI recommendation endpoints
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   │
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Base UI components (buttons, inputs, cards, etc.)
│   │   ├── layout/             # Layout components (header, footer, sidebar)
│   │   ├── forms/              # Reusable form components
│   │   ├── data-display/       # Tables, charts, lists for displaying data
│   │   └── feedback/           # Toast, banner, modal components
│   │
│   ├── lib/                    # Shared libraries and utilities
│   │   ├── db/                 # Database layer
│   │   │   ├── client.ts       # Prisma client singleton
│   │   │   ├── repositories/   # Data access patterns per entity
│   │   │   └── migrations/     # Prisma migration files
│   │   │
│   │   ├── services/           # Business logic layer
│   │   │   ├── skillGapService.ts      # Gap calculation logic
│   │   │   ├── prioritizationService.ts # Skill prioritization algorithms
│   │   │   ├── projectRecommendationService.ts # Project-to-gap mapping
│   │   │   ├── roadmapService.ts       # Roadmap generation and updating
│   │   │   ├── progressService.ts      # Progress tracking and evidence processing
│   │   │   └── validationService.ts    # Business rule validation
│   │   │
│   │   ├── ai/                 # AI integration layer
│   │   │   ├── client.ts       # AI API client wrapper
│   │   │   ├── prompts/        # Prompt templates for different AI tasks
│   │   │   ├── tools/          # Function definitions for AI tool calling
│   │   │   └── processors/     # AI response processing and validation
│   │   │
│   │   ├── infrastructure/     # External services and configuration
│   │   │   ├── auth.ts         # NextAuth configuration
│   │   │   ├── github.ts       # GitHub API client
│   │   │   ├── config.ts       # Environment variable validation
│   │   │   └── error-handling.ts # Centralized error handling
│   │   │
│   │   ├── types/              # TypeScript type definitions
│   │   │   ├── db.ts           # Database model types (generated by Prisma)
│   │   │   ├── services/       # Service-specific types
│   │   │   ├── ui/             # UI component props types
│   │   │   └── index.ts        # Barrel exports
│   │   │
│   │   ├── utils/              # Utility functions
│   │   │   ├── formatters.ts   # Data formatting helpers
│   │   │   ├── validators.ts   # General validation helpers
│   │   │   └── constants.ts    # Application constants
│   │   │
│   │   └── hooks/              # Custom React hooks
│   │       ├── useAuth.ts      # Authentication hooks
│   │       ├── useStudent.ts   # Student data hooks
│   │       └── useApi.ts       # API request hooks
│   │
│   ├── scripts/                # Utility scripts
│   │   ├── seed.ts             # Database seeding script
│   │   └── migrate.ts          # Migration helper
│   │
│   └── styles/                 # Global styles and CSS variables
│       └── globals.css         # Imported in layout.tsx
│
├── prisma/                     # Prisma schema and migrations
│   ├── schema.prisma           # Database schema definition
│   └── migrations/             # Auto-generated migration files
│
├── public/                     # Static assets
│   └── ...                     # Images, icons, etc.
│
├── tests/                      # Test files
│   ├── unit/                   # Unit tests for services and utils
│   ├── integration/            # Integration tests for API routes
│   └── e2e/                    # End-to-end tests
│
├── .github/                    # GitHub workflows
│   └── workflows/
│       └── ci.yml              # Continuous integration
│
├── .env.example               # Example environment variables
├── .eslintrc.js               # ESLint configuration
├── .gitignore                 # Git ignore file
├── components.json            # For shadcn/ui if used
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies and scripts
├── postcss.config.mjs         # PostCSS configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Project documentation
```

## E. Dependencies We Actually Need

Based on the architecture and requirements, we recommend adding only these essential dependencies:

### Core Framework (already present)
- `next`: 16.3.6
- `react`: 19.2.8
- `react-dom`: 19.2.8
- `typescript`: ^5

### Development Dependencies (already present)
- `@types/node`: ^20
- `@types/react`: ^19
- `@types/react-dom`: ^19
- `eslint`: ^9
- `eslint-config-next`: 16.3.6
- `tailwindcss`: ^4
- `@tailwindcss/postcss`: ^4

### New Dependencies to Add

#### 1. Database & ORM
- `@prisma/client`: ^5.0.0 (Prisma client for database access)
- `prisma`: ^5.0.0 (Prisma CLI for migrations)
- `@node-rs/argon2`: ^1.0.0 (for password hashing if needed)
- OR `@auth/prisma-adapter`: ^1.0.0 (if using NextAuth with Prisma)

#### 2. Authentication
- `next-auth`: ^5.0.0 (for secure authentication)
- `@auth/prisma-adapter`: ^1.0.0 (Prisma adapter for NextAuth)

#### 3. Validation
- `zod`: ^3.0.0 (for schema validation)
- `@hookform/resolvers`: ^3.0.0 (if using React Hook Form)

#### 4. UI Enhancements (Optional but recommended)
- `class-variance-authority`: ^0.4.0 (for CVA pattern)
- `clsx`: ^2.0.0 (for conditional class names)
- `tailwind-merge`: ^2.0.0 (for merging Tailwind classes)
- `lucide-react`: ^0.300.0 (for icons)

#### 5. Data Visualization (for charts/graphs in dashboard)
- `recharts`: ^2.0.0 (or alternatively `chart.js` + `react-chartjs-2`)
- OR `vizzu`: ^0.11.0 (for animated charts)

#### 6. Date Handling
- `date-fns`: ^3.0.0 (for date formatting and manipulation)

#### 7. HTTP Client (for external APIs)
- `axios`: ^1.0.0 (or use native fetch with wrappers)

#### 8. AI Integration
- Depending on provider:
  - For Anthropic Claude: `@anthropic-ai/sdk`: ^0.20.0
  - For OpenAI: `openai`: ^4.0.0

### Scripts to Add to package.json
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "seed": "ts-node scripts/seed.ts",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

### Dev Dependencies to Add
```json
{
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5",
    "eslint": "^9",
    "eslint-config-next": "16.3.6",
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4",
    "prisma": "^5.0.0",
    "@types/prisma": "^5.0.0",
    "@types/node": "^20",
    "ts-node": "^10.0.0",
    "@types/jest": "^29.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0"
  }
}
```

## F. Development Phases (Adapted from Project Roadmap)

We'll follow a modified version of the proposed roadmap, focusing on delivering value incrementally:

### Phase 0: Foundation (Week 1)
- Set up development environment and tooling
- Implement database schema with Prisma
- Configure authentication (NextAuth)
- Set up error handling and logging
- Create basic layout and navigation
- Implement environment variable validation
- **Deliverable**: Working authentication system, database connection, basic UI shell

### Phase 1: Student Profile (Week 2)
- Build profile creation and editing forms
- Implement skill input interface (with search/autocomplete)
- Add education, experience, projects, certifications sections
- Implement GitHub profile connection (basic)
- Add weekly availability setting
- **Deliverable**: Complete student profile CRUD operations

### Phase 2: Career Goal Setting (Week 2-3)
- Build role selection/search interface
- Implement target role, experience level, timeline forms
- Add preferred technologies selection
- **Deliverable**: Students can define their career goals

### Phase 3: Skill Intelligence (Week 3)
- Create skill catalog interface (admin/seed data)
- Implement role-skill requirement definitions
- Build skill assessment interface (self-assessment for now)
- **Deliverable**: Structured skill data for roles and student assessments

### Phase 4: Skill Gap Engine (Week 4)
- Implement gap calculation (current vs required proficiency)
- Add status indicators (LOW, MEDIUM, HIGH gap)
- Implement confidence scoring based on evidence
- Add explainability layer (why a gap exists)
- **Deliverable**: Skill gap analysis with explanations

### Phase 5: Skill Prioritization (Week 4-5)
- Implement prioritization algorithm (gap size, importance, dependencies, effort)
- Add dependency tracking between skills
- Generate prioritized skill list with reasoning
- **Deliverable**: Ordered skill recommendations with explanations

### Phase 6: Project Recommendation Engine (Week 5)
- Build project catalog (seed with relevant projects)
- Implement skill-to-project mapping
- Generate project recommendations addressing multiple gaps
- Add project explanations (why recommended, skills addressed)
- **Deliverable**: Project recommendations with gap coverage analysis

### Phase 7: Personalized Roadmap (Week 6)
- Implement roadmap generation from prioritized skills/projects
- Create weekly schedule based on availability
- Add learning modules, tasks, milestones, projects
- Implement drag-and-drop reordering (optional)
- **Deliverable**: Interactive personalized learning roadmap

### Phase 8: Progress & Evidence (Week 6-7)
- Build task completion tracking
- Implement evidence upload (GitHub, certificates, etc.)
- Add quiz/assessment integration
- Create progress visualization
- **Deliverable**: Progress tracking with evidence collection

### Phase 9: Adaptive Engine (Week 7-8)
- Implement reassessment triggers (on evidence update)
- Add gap recalculation logic
- Implement roadmap comparison and change detection
- Generate adaptive roadmap proposals
- **Deliverable**: System that suggests roadmap updates based on progress

### Phase 10: AI Agent (Week 8-9)
- Integrate AI for enhanced analysis (profile summarization, gap explanations)
- Implement tool/function calling for AI to access data
- Add AI-generated project suggestions and roadmap adjustments
- Maintain human-in-the-loop for all AI recommendations
- **Deliverable**: AI-enhanced insights with explainability and user control

### Phase 11: Human-in-the-Loop (Throughout)
- Implement accept/modify/reject workflow for AI suggestions
- Add audit trail for all changes
- Create recommendation review interface
- **Deliverable**: User control over AI-generated recommendations

### Phase 12: Graceful Failure (Throughout)
- Implement fallback mechanisms for missing data
- Add loading, error, and empty states
- Handle API failures gracefully
- Show uncertainty when AI confidence is low
- **Deliverable**: Robust system that degrades gracefully

### Phase 13: Dashboard (Week 9)
- Build overview dashboard showing:
  - Career readiness percentage
  - Skill gap heatmap
  - Prioritized skills list
  - Current roadmap progress
  - Recent evidence and achievements
- **Deliverable**: Comprehensive dashboard for student overview

### Phase 14: Demo & Polish (Week 10)
- Add UX polish (animations, transitions)
- Implement responsive design breakpoints
- Add demo data for presentations
- Conduct performance optimization
- Prepare final documentation and presentation materials
- **Deliverable**: Polished, demo-ready application

## G. Recommended First Implementation

Based on the dependencies and logical flow, we recommend implementing in this order:

### 1. **Foundation First (Do this immediately)**
   - Set up Prisma with PostgreSQL (or SQLite for initial development)
   - Implement the core database schema (Student, CareerGoal, Skill, Role, RoleSkill, StudentSkill)
   - Configure NextAuth with email/password or GitHub provider
   - Create basic layout with navigation
   - Set up environment validation and error handling

### 2. **Student Profile (Next Priority)**
   - Build profile creation/edit forms
   - Implement skill input with autocomplete (using the Skill catalog)
   - Add GitHub connection (basic profile fetch)
   - Validate all inputs with Zod

### 3. **Skill Assessment Engine (Core Value)**
   - Implement the StudentSkill model with proficiency and confidence
   - Build self-assessment interface (sliders or rating scales)
   - Calculate initial skill gaps against career goals
   - Display gaps with basic explanations

### 4. **Prioritization and Roadmap (MVP Core)**
   - Implement skill prioritization algorithm
   - Generate initial learning roadmap
   - Create basic roadmap visualization
   - Add progress tracking

### Why This Order?
1. **Foundation** enables everything else - without database and auth, we can't persist data
2. **Student Profile** is the starting point for all personalization
3. **Skill Assessment Engine** delivers the core value proposition (knowing your gaps)
4. **Prioritization and Roadmap** turn insights into actionable plans

This approach ensures we deliver tangible value early while building toward the full vision. Each phase builds upon the previous one, and we can demonstrate working functionality after just 2-3 phases.

We recommend starting with Phase 0 (Foundation) and Phase 1 (Student Profile) before moving to the core skill gap functionality.

