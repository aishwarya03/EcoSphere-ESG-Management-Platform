# EcoSphere — ESG Management Platform

EcoSphere integrates ESG (Environmental, Social, Governance) tracking directly into day-to-day
operations: carbon accounting, CSR participation, governance compliance, and gamification, unified
under one platform with role-based access (Admin / Employee) per organization.

## Tech stack

- **Server**: Node.js (Express 5), PostgreSQL (Neon), Prisma ORM
- **Auth**: JWT, bcrypt password hashing
- **Client**: React + Vite (scaffolding only at this stage)

## Getting started (server)

```bash
cd server
npm install
```

Create `server/.env` (see `server/.env.example` for the full list):

```
DATABASE_URL="<your Neon pooled connection string>"
DIRECT_URL="<your Neon direct connection string>"
JWT_SECRET="<a long random string>"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
PORT=3000
```

Run migrations and load demo data:

```bash
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

The server starts on `http://localhost:3000`. `npx prisma db seed` **wipes and rebuilds** all
demo data every time it's run — safe to re-run whenever you want a clean, consistent dataset.

## Demo credentials

Two accounts are seeded for evaluating both views of the platform:

| Role | Username | Email | Password |
|---|---|---|---|
| **Admin** | `admin` | `admin@ecosphere.demo` | `Admin@12345` |
| **Employee** | `employee` | `employee@ecosphere.demo` | `Employee@12345` |

Log in via `POST /api/auth/login` with `{ "identifier": "<username or email>", "password": "..." }`.

- The **Admin** account manages departments, categories, master data (products, emission
  factors, goals, policies, badges, rewards), reviews CSR/Challenge submissions, and can view
  org-wide scores/reports.
- The **Employee** account (`employee`) already has real activity attached — an approved CSR
  participation (Tree Planting Drive) and an approved Challenge (Bike to Work Week) — so its own
  profile/activity view isn't empty.

Additional demo employees (`priya.sharma`, `rahul.verma`, `ananya.iyer`, `karthik.nair`,
`divya.menon`, `arjun.singh`, `meera.pillai`) all share the password `Employee@12345`, spread
across 5 departments (Engineering, Logistics, Human Resources, Sales & Marketing, Sustainability)
with varied CSR/Challenge/policy-acknowledgement activity, so department ESG scores show a
realistic spread rather than flat numbers.

## What's built

- **Foundation**: Organization/User auth, invite-based onboarding (single + bulk `.xlsx` import), Admin/Employee RBAC
- **Settings & Administration**: Departments, Categories, ESG Configuration (E/S/G weights + feature toggles)
- **Master Data**: Products + versioned ESG Profiles, Emission Factors, Environmental Goals, ESG Policies, Badges, Rewards
- **Environmental**: Carbon Transactions, Operational Records with Auto Emission Calculation
- **Social**: CSR Activities + Employee Participation (with evidence-requirement enforcement)
- **Gamification (partial)**: Challenges + Challenge Participation (XP awarding)
- **Governance**: ESG Policy Acknowledgement, Audits, Compliance Issues (with overdue tracking)
- **Scoring**: Department-level and org-wide weighted ESG scores, computed from live transactional data

## Not yet built

- Reward Redemption and Badge Auto-Award (Gamification wallet)
- Notification System (in-app/email)
- Reports (Environmental/Social/Governance/ESG Summary + Custom Report Builder)
- Diversity Metrics & Training Completion
- Frontend dashboard/UI
