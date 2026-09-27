# GAPLY - AI Skill-Gap & Personalized Learning Agent

**Built for Bit N Build '26 Hackathon - Problem Statement: PS 05 — Education & Employability**

## Overview

GAPLY is an AI-powered learning platform that helps students identify their skill gaps relative to their target career roles, provides personalized learning recommendations, and generates adaptive roadmaps that evolve as they progress.

## Features

- **Student Profile Management**: Track your education, skills, experience, and learning availability
- **Career Goal Setting**: Define your target role, timeline, and preferred technologies
- **Skill Gap Analysis**: See exactly what skills you're missing compared to your target role
- **Explainable Recommendations**: Understand why each skill gap matters for your career goals
- **Smart Prioritization**: Get personalized recommendations on what to learn first
- **Project-Based Learning**: Receive project suggestions that build multiple skills simultaneously
- **Adaptive Roadmaps**: Follow a personalized weekly learning schedule that evolves as you progress
- **Progress Tracking**: Record your learning evidence (projects, certificates, etc.) to update your proficiencies
- **AI-Enhanced Insights**: Get personalized explanations and suggestions (placeholder for AI integration)

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

```bash
# Start the development server
npm run dev

# Open your browser to http://localhost:3000
```

### Demo Credentials

For the simplified authentication system:
- Email: demo@gaply.com
- Password: password123

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Authentication routes
│   ├── (dashboard)/      # Dashboard routes (protected)
│   ├── not-found.tsx     # 404 page
│   ├── error.tsx         # Error page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home/Landing page
├── components/           # Reusable UI components
│   └── providers.tsx     # Auth context provider
├── lib/                  # Shared libraries and utilities
│   ├── data/             # In-memory data layer (demo)
│   ├── services/         # Business logic layer
│   └── index.ts          # Barrel exports
└── scripts/              # Utility scripts
    └── seed.ts           # Database seeding script
```

## Core Services

1. **Skill Gap Service** - Calculates proficiency gaps between current and target levels
2. **Prioritization Service** - Ranks skills by gap size, importance, dependencies, etc.
3. **Project Recommendation Service** - Suggests projects addressing multiple skill gaps
4. **Roadmap Service** - Generates personalized weekly learning schedules
5. **Progress Service** - Tracks learning evidence and updates proficiencies
6. **AI Service** - Placeholder for AI-enhanced insights (ready for API integration)

## Architecture

- **Separation of Concerns**: UI ↔ Application Logic ↔ Business Logic ↔ Data Layer
- **Explainability**: Every recommendation includes clear rationale
- **Human-in-the-Loop**: Designed for easy approval/modification workflows
- **Upgrade Path**: Simple swap to Prisma/PostgreSQL when environment allows
- **Testable**: All services are framework-agnostic and easily unit-testable

## Demo Workflow

1. Sign in with demo credentials (demo@gaply.com / password123)
2. Visit your profile to view/edit your information and skills
3. Set your career goal (e.g., "Full Stack Developer")
4. Visit the Skills page to see your skill gap analysis
5. Explore project recommendations on the Projects page
6. View your personalized learning roadmap on the Roadmap page
7. Record progress by completing activities and adding evidence

## Development

This implementation uses a simplified in-memory data layer for demonstration purposes. To use with a real database:

1. Resolve WSL2/npm installation issues for Prisma and NextAuth
2. Uncomment the PostgreSQL datasource in `prisma/schema.prisma`
3. Run `npm run prisma:migrate` to set up the database
4. Update the data layer to use Prisma instead of the in-memory implementation

## License

MIT

Built with ❤️ for Bit N Build '26 Hackathon