# Documentation Consistency Report

## Missing Spec Coverage
- **AI Project Generator**: While listed in `docs/engineering/feature_specs.md`, it lacks a detailed spec in `docs/specs/` (e.g., `ai_planner.md`) covering input prompts, JSON cleaning logic, and the "Import" flow.
- **Analytics View**: The UI has a sidebar item for "Analytics" (currently disabled), but there is no spec defining what metrics it will track.
- **Project Limits**: The product strategy mentions a "3-project limit (Free plan)", but this logic is not documented in any feature spec or implemented in the `projectStore.js` insert logic yet.

## Spec-Code Mismatch
- **Task Dependencies**: `docs/specs/task_crud.md` mentions "Dependencies (Optional)" and "Calculate task duration", but the current `projectStore.js` and `ProjectEditor.jsx` do not fully implement dependency-based date calculations (only simple date validation).
- **Data Sync**: `docs/specs/data_sync.md` mentions "Use updated_at timestamp to resolve conflicts", but the current `projectStore.js` uses a simple `update` or `insert` without conflict resolution logic.
- **Auth Redirect**: `docs/specs/user_auth.md` says "Redirect to /", but `App.jsx` handles conditional rendering based on `user` presence rather than a hard redirect for every case.

## Architecture Mismatch
- **Tech Stack**: `docs/engineering/TECH_STACK.md` incorrectly lists "Next.js". The project is actually built with **React + Vite** (confirmed by `package.json` and `vite.config.js`).
- **Backend**: `docs/engineering/ARCHITECTURE.md` lists "Backend services" vaguely. It should specify **Vercel Serverless Functions** and **Supabase (BaaS)**.

## Database Mismatch
- **Updated_at Logic**: `docs/engineering/database_schema.md` and `projectStore.js` agree on the schema, but the automatic `updated_at` trigger in Supabase (PostgreSQL) is not explicitly documented as a database rule or schema requirement.

## Scope Misalignment
- **Multi-language Support**: `docs/strategy/AI_PROJECT_PLANNER_MASTER_CONTEXT.md` mentions "Implemented: Multi-language support (CN/EN)" in Phase 0, but the current React codebase does not show i18n implementation (e.g., `react-i18next`).

## STRATEGY_ALIGNMENT_ISSUES
- **Free Plan Limits**: The 3-project limit is strategic (`docs/strategy/AI_PROJECT_PLANNER_MASTER_CONTEXT.md`) but not yet enforced in the database (`RLS` or `insert` logic) or documented in `docs/specs/project_crud.md`.
- **Architecture Transition**: `docs/strategy/AI_PROJECT_PLANNER_MASTER_CONTEXT.md` says "Step 3: Modernize the architecture to React + Vite", which is done, but `docs/engineering/TECH_STACK.md` still says "Next.js", creating a strategic mismatch with reality.
