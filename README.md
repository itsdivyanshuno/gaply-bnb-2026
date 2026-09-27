# GAPLY

### Career guidance that starts with where you are.

GAPLY is a personalized career-readiness platform that helps students understand the gap between their current skills and the skills required for their target role.

Instead of following generic learning paths, GAPLY uses a student's **career goal, current skills, skill gaps, learning availability, and project requirements** to generate a personalized development plan.

> **Know your gap. Build what matters. Move forward with clarity.**

---

## 🚀 What is GAPLY?

Students often know the career they want but don't know:

* Which skills they are missing
* How far they are from their target role
* What they should learn first
* Which projects would strengthen their profile
* How much time they need to invest
* Whether their current learning path is aligned with their goal

GAPLY brings these pieces together into one personalized platform.

### Core Flow

```text
Career Goal
     ↓
Current Skills
     ↓
Skill Gap Analysis
     ↓
Skill Prioritization
     ↓
Project Recommendations
     ↓
Personalized Roadmap
     ↓
Progress & Iteration
```

---

## ✨ Key Features

### 🎯 Career Goals

Define your career direction by providing:

* Target role
* Experience level
* Learning timeline
* Preferred technologies
* Weekly learning availability

Your career goal becomes the foundation for GAPLY's personalization engine.

---

### 🧠 Skill Gap Analysis

GAPLY compares your current proficiency with the proficiency required for your target role.

The platform provides:

* Current proficiency
* Required proficiency
* Skill gap
* Gap severity
* Confidence
* Explanation
* Overall readiness

This helps answer:

> **"What am I missing for the role I want?"**

---

### 📊 Personalized Dashboard

The dashboard provides an overview of your current career-readiness state.

It is connected to user-specific data rather than relying on hardcoded sample statistics.

---

### 🛠️ Project Recommendations

GAPLY recommends projects based on the skills required for your selected career goal.

Projects are evaluated using factors such as:

* Skill coverage
* Missing skills
* Estimated effort
* Difficulty
* Current readiness

The goal is not simply to build more projects, but to build projects that address meaningful skill gaps.

---

### 🗺️ Personalized Roadmap

GAPLY generates a learning roadmap using:

* Current skill gaps
* Skill priorities
* Career goal
* Weekly availability
* Learning timeline
* Recommended projects

The roadmap is organized into weekly learning activities so students can follow a structured path instead of randomly jumping between topics.

---

### 👤 Personalized Profile

Each user's profile contains their own academic and learning information.

User-specific data is kept separate so different accounts do not share the same profile information.

---

## 🔄 How GAPLY Personalizes Recommendations

GAPLY follows a decision pipeline:

```text
              ┌─────────────────┐
              │   Career Goal   │
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │ Current Skills  │
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │  Skill Analysis │
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │ Skill Priority  │
              └────────┬────────┘
                       ↓
          ┌────────────┴────────────┐
          ↓                         ↓
 ┌─────────────────┐       ┌─────────────────┐
 │ Project Engine  │       │ Roadmap Engine  │
 └────────┬────────┘       └────────┬────────┘
          ↓                         ↓
          └────────────┬────────────┘
                       ↓
             Personalized Action Plan
```

The application uses actual user and database data to generate recommendations instead of displaying fabricated user progress or placeholder learning resources.

---

## 🧩 Tech Stack

### Frontend

* Next.js 16
* React
* TypeScript
* Tailwind CSS

### Backend

* Next.js API Routes
* TypeScript
* Service-based architecture

### Database

* PostgreSQL
* Prisma ORM

### Authentication

* Custom authentication API
* bcrypt password hashing
* Client-side session persistence

### Architecture

```text
┌─────────────────────┐
│        UI           │
│   Next.js + React   │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│      API Routes     │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│      Services       │
│ Skill / Roadmap /   │
│ Project / Progress  │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│   Data / Repository │
│       Layer         │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│     PostgreSQL      │
└─────────────────────┘
```

---

## 📁 Project Structure

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── signin/
│   │   ├── signup/
│   │   └── signout/
│   │
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── career-goal/
│   │   ├── profile/
│   │   ├── projects/
│   │   ├── roadmap/
│   │   └── skills/
│   │
│   └── api/
│       ├── auth/
│       │   ├── signin/
│       │   └── signup/
│       ├── career-goal/
│       ├── projects/
│       ├── roadmap/
│       └── skills/
│
└── lib/
    ├── data/
    │   └── store.ts
    │
    └── services/
        ├── skillGapService.ts
        ├── projectRecommendationService.ts
        ├── prioritizationService.ts
        ├── roadmapService.ts
        └── progressService.ts
```

---

## 🔌 API Routes

| Endpoint           | Method | Purpose                          |
| ------------------ | ------ | -------------------------------- |
| `/api/auth/signup` | POST   | Create a new account             |
| `/api/auth/signin` | POST   | Authenticate a user              |
| `/api/career-goal` | GET    | Retrieve a user's career goal    |
| `/api/career-goal` | POST   | Create or update a career goal   |
| `/api/skills`      | GET    | Generate skill-gap analysis      |
| `/api/projects`    | GET    | Generate project recommendations |
| `/api/roadmap`     | GET    | Generate a personalized roadmap  |

Most personalized endpoints require a `studentId`.

---

## 🗄️ Database Structure

GAPLY uses Prisma ORM with PostgreSQL.

Core entities include:

```text
Student
   │
   ├── CareerGoal
   ├── StudentSkill
   ├── Evidence
   ├── Assessment
   ├── Roadmap
   ├── Recommendation
   └── Progress
```

This structure connects a student's career objective with their skills, evidence, recommendations, roadmap, and progress.

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/itsdivyanshuno/gaply-bnb-2026.git
cd gaply-bnb-2026
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="your-postgresql-connection-string"
```

Add any other environment variables required by your local configuration.

> **Never commit `.env` files or production credentials to GitHub.**

### 4. Set Up the Database

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate Prisma Client if required:

```bash
npx prisma generate
```

### 5. Start the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🏗️ Production Build

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

---

## 🔐 Data & Security

GAPLY is designed around user-specific data.

The application:

* Associates career goals with individual students
* Associates skills with individual students
* Keeps profile information user-specific
* Does not intentionally populate new accounts with fabricated career progress
* Does not expose placeholder `#` learning links as real resources
* Hashes account passwords before storing them

For production deployments, the authentication system should additionally use secure server-side sessions, authorization checks, HTTPS, secure cookies, and appropriate database security controls.

---

## 📌 Current Status

GAPLY currently includes:

* [x] User registration
* [x] User authentication
* [x] Personalized profile
* [x] Career goal management
* [x] Skill-gap analysis
* [x] Skill prioritization
* [x] Project recommendations
* [x] Personalized roadmap
* [x] User-specific dashboard
* [x] Dynamic data flow
* [x] PostgreSQL + Prisma integration
* [x] Production build verification

---

## 🔮 Future Scope

Potential future improvements include:

* Real learning-resource integrations
* Evidence-based skill updates
* Progress tracking and completion analytics
* Resume analysis
* Job-description matching
* Industry/company-specific skill requirements
* AI-assisted career explanations
* Notifications and reminders
* Advanced progress visualizations
* Secure server-side authentication and authorization
* More granular roadmap adaptation based on learning evidence

---

## 🎯 The Idea Behind GAPLY

> **Don't learn everything. Learn what moves you closer to your goal.**

A career goal gives direction.

Skill-gap analysis identifies what is missing.

Project recommendations turn gaps into practical work.

The roadmap converts that analysis into an actionable plan.

GAPLY brings these pieces together into one personalized career-readiness platform.

---

## 👨‍💻 Author

**Divyansh Shukla**

B.Tech Information Technology
Harcourt Butler Technical University, Kanpur

GitHub: [@itsdivyanshuno](https://github.com/itsdivyanshuno)

---

## 📄 License

This project is currently developed as an academic/hackathon project.

If the project is intended to be distributed as open source, add an appropriate license such as MIT License.
