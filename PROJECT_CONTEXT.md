# GAPLY Project Context

## Project Identity
- **Name**: GAPLY
- **Tagline**: "Bridging the gap between where you are and where you want to be."
- **Hackathon**: Bit N Build '26 — UP Regionals
- **Problem Statement**: PS 05 — Education & Employability: "AI Skill-Gap & Personalized Learning Agent"

## Why We Are Building GAPLY
Students know their target career but lack clarity on:
1. Current skills
2. Missing skills
3. Skill gap sizes
4. Priority of missing skills
5. What to learn first
6. Projects to build skills
7. Realistic learning roadmap
8. Adapting the roadmap as they improve

Gaply takes **CURRENT STUDENT STATE** + **TARGET CAREER** and produces:
- Skill gaps → Priorities → Learning plan → Project recommendations → Personalized roadmap → Progress tracking → Reassessment → Adaptive roadmap

## Core Product Idea
The fundamental Gaply loop:
1. WHERE AM I? (Student Profile + Evidence)
2. WHERE DO I WANT TO GO? (Target Career Role)
3. WHAT AM I MISSING? (Skill Gap Analysis)
4. WHAT SHOULD I DO FIRST? (Skill Prioritization)
5. WHAT SHOULD I BUILD? (Project Recommendation)
6. HOW SHOULD I LEARN? (Personalized Roadmap)
7. AM I ACTUALLY IMPROVING? (Progress + Evidence)
8. WHAT SHOULD CHANGE NOW? (Reassessment + Adaptive Roadmap)

## Example
Target: Full Stack Developer
Current Skills: JavaScript 75, React 65, Node.js 40, PostgreSQL 25, Testing 15, System Design 10
Gaply compares against required skills and explains:
- Why a skill is important
- Why it's a priority
- What to learn
- What project demonstrates the skill
- Where it fits in the roadmap

## Core Product Flow
Student Profile → Target Career → Skill Assessment → Skill Intelligence → Skill Gap Analysis → Skill Prioritization → Project Recommendation → Personalized Learning Roadmap → Progress & Evidence → Reassessment → Adaptive Roadmap → Human Approval → Updated Roadmap

## What Gaply Must NOT Be
- Generic ChatGPT wrapper
- Chatbot giving generic career advice
- Static course recommendation website
- Static roadmap generator
- Hardcoded skill list
- Arbitrary AI-generated skill scores
- Generic project recommendations
- Fake "AI" buttons producing only text
- Beautiful frontend with no real backend logic

## Core Features
1. **Student Profile**: Persistent storage of name, education, skills, experience, projects, certifications, GitHub, availability.
2. **Career Goal**: Target role, experience level, timeline, preferred technologies, weekly availability.
3. **Skill Intelligence**: Structured representation of skills per role (name, required proficiency, importance, dependencies, related skills, evidence requirements).
4. **Skill Gap Engine**: Compares current vs required proficiency, calculates gap, priority, status, confidence, with explainability.
5. **Skill Prioritization**: Answers "What should I learn FIRST?" based on gap size, role importance, dependencies, project relevance, learning effort, current proficiency, evidence.
6. **Project Recommendation Engine**: Recommends projects that address multiple skill gaps, explains why selected, which gaps addressed, what evidence gained.
7. **Personalized Learning Roadmap**: Converts skill gaps into roadmap with learning modules, tasks, milestones, projects, estimated effort, order, dependencies, weekly schedule.
8. **Progress & Evidence**: Tracks completed tasks, quiz results, skill assessments, projects, GitHub repositories, activity, certifications, self-assessment, completed milestones.
9. **Adaptive Roadmap**: Changes roadmap when student state changes (progress triggers reassessment, recalculation, reprioritization, re-planning).
10. **AI Agent**: Analyzes profile, career goal, skills, evidence; identifies gaps; prioritizes skills; recommends learning/projects; generates roadmap; analyzes progress; proposes roadmap changes using tools to interact with persistent data.

## Advanced System Requirements
- **Persistent State**: Remember profile, career goal, skills, assessments, evidence, projects, progress, roadmap, history, AI recommendations, accepted/rejected changes.
- **Explainability**: Every important recommendation answers WHY?
- **Human-in-the-Loop**: AI proposes changes; user can Accept/Modify/Reject.
- **Graceful Failure**: Handle missing data, unknown roles, insufficient evidence, AI uncertainty without hallucination.

## Technical Direction
- **Stack**: Next.js, TypeScript, Tailwind CSS, App Router (existing)
- **Additions**: Database, authentication, AI provider, external APIs, GitHub integration, validation, charts, state management (only as needed)

## Architecture Principles
Separate concerns: UI → Application Logic → Domain/Business Logic → AI/Agent Layer → Data Layer → External APIs
Business logic should be independently testable (skill-gap calculation, project recommendation, roadmap generation).
AI orchestrates intelligent decisions but does not replace deterministic logic where appropriate.

## Database Concept (Proposed)
Entities: Student, CareerGoal, Skill, Role, RoleSkill, StudentSkill, Assessment, Evidence, Project, ProjectSkill, Roadmap, RoadmapItem, Progress, Recommendation, RoadmapChange, AgentAction

## Development Roadmap (Phases)
0. Foundation: Architecture, env vars, base UI, components, DB setup, validation, error handling, git workflow
1. Student Profile: Creation, editing, skill input, experience, projects, certifications, GitHub, availability
2. Career Goal: Target role, timeline, experience level, preferred technologies, availability
3. Skill Intelligence: Role definitions, required skills, skill levels, importance, dependencies, evidence model
4. Skill Gap Engine: Current vs required, gap calculation, status, confidence, explainability
5. Prioritization: Priority algorithm, dependencies, importance, gap, effort, explainability
6. Project Intelligence: Project database, skill mapping, gap matching, recommendation engine, explanations
7. Personalized Roadmap: Learning modules, tasks, milestones, projects, schedule, dependencies
8. Progress & Evidence: Task completion, assessments, projects, GitHub, certifications, evidence scoring
9. Adaptive Engine: Reassessment, gap recalculation, priority recalculation, roadmap comparison, proposed changes, roadmap history
10. AI Agent: Tool/function calling, profile analysis, gap analysis, recommendations, roadmap generation, progress analysis, adaptive proposals
11. Human-in-the-Loop: Accept, Modify, Reject, audit history
12. Graceful Failure: API failures, missing data, unknown roles, insufficient evidence, AI uncertainty
13. Dashboard: Overview, career readiness, skill gaps, priorities, roadmap, projects, progress, AI Agent
14. Demo & Polish: UX polish, loading/error/empty states, responsive design, demo data, testing, performance, final README, PPT, demo video

## MVP (First Complete Working Version)
- Student Profile
- Target Role
- Skill Assessment
- Skill Gap Engine
- Explainable Prioritization
- Project Recommendation
- Personalized Roadmap
- Progress Tracking
- Adaptive Roadmap
- Persistent Database

## Differentiators (Must Actually Work)
- Evidence-based skill scoring
- Skill dependencies
- Real-world role/skill data
- GitHub analysis
- Project-to-gap mapping
- Explainable recommendations
- Persistent student state
- AI tool calling
- Adaptive roadmap
- Human approval
- Confidence scores
- Graceful failure
- Roadmap history

## Ideal Demo Story
A student wants to become a Full Stack Developer:
1. Creates profile
2. Adds current skills
3. Connects GitHub
4. Selects Full Stack Developer
5. Gaply analyzes profile
6. Gaply shows skill gaps
7. Gaply explains WHY gaps exist
8. Gaply prioritizes most important gaps
9. Gaply recommends project addressing multiple gaps
10. Gaply creates personalized roadmap
11. Student completes task/assessment
12. Evidence changes skill state
13. Gaply reassesses
14. Gaply proposes roadmap change
15. Student accepts change
16. Roadmap updates
Judge sees: CURRENT STATE → GAP → WHY → ACTION → PROGRESS → ADAPTATION

## Important Development Rules
1. Do not build entire application in one response.
2. Do not modify files without understanding existing repository.
3. Inspect existing code before changing.
4. Do not install unnecessary dependencies.
5. Do not use fake AI functionality.
6. Do not use arbitrary skill scores.
7. Do not hardcode static roadmap as final solution.
8. Keep business logic separate from UI.
9. Keep AI logic separate from deterministic calculations.
10. Use strong TypeScript types.
11. Validate inputs.
12. Handle errors properly.
13. Build reusable components.
14. Keep database design scalable.
15. Keep product demo-friendly.
16. Every major feature must connect back to PS05 problem.
17. If feature does not help solve core problem, question need.
18. Do not over-engineer before MVP works.
19. Do not replace working architecture without concrete reason.
20. Before major implementation decisions, explain decision briefly.
21. After implementing a phase, run appropriate checks/tests.
22. Keep Git commits meaningful and phase-based.
