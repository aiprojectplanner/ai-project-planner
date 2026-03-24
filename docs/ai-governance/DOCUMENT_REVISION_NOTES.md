# Document Revision Notes
 
This document records documentation consistency issues found during a governance-level scan. It is meant to guide future documentation updates without changing application code.
 
## Scope of Scan
- `docs/strategy/AI_PROJECT_PLANNER_MASTER_CONTEXT.md`
- `docs/ai-governance/AI_SYSTEM_CONTEXT.md`
- `docs/strategy/PRODUCT_SCOPE.md`
- `docs/roadmap/ROADMAP.md`
- `docs/engineering/ARCHITECTURE.md`
- `docs/specs/*.md`
 
## Findings
 
### 1. Files Needing Improvement
 
#### docs/strategy/AI_PROJECT_PLANNER_MASTER_CONTEXT.md
- **What is missing / mismatched**
  - Still claims “Current Stack in GitHub: Vanilla HTML/JS” and lists “Integrate Supabase” as unfinished.
  - Current repository is already React + Vite and includes Supabase Auth + DB integration.
- **Why it matters**
  - This is the strategic historical record. If it is stale, AI agents will make incorrect assumptions.
- **Founder approval required**
  - **Yes** (Strategic document; must not be modified automatically).
 
#### docs/ai-governance/AI_SYSTEM_CONTEXT.md
- **What is missing / mismatched**
  - `Tech Stack Rules` lists “Backend: Supabase” but the implemented architecture includes **Vercel Serverless Functions** for `/api/*` in addition to Supabase.
- **Why it matters**
  - Cross-layer debugging and architecture decisions depend on accurate system boundaries.
- **Founder approval required**
  - No (Governance doc), unless you want to treat it as strategic.
 
#### docs/engineering/ARCHITECTURE.md
- **What is missing / mismatched**
  - Data persistence flow states `supabase.from('projects').upsert()`, but current code uses explicit `insert` or `update` (not `upsert`).
- **Why it matters**
  - Misstating persistence behavior can mislead debugging and conflict-resolution design.
- **Founder approval required**
  - No (Governance doc).
 
#### docs/roadmap/ROADMAP.md
- **What is missing / mismatched**
  - Roadmap marks “Project deletion … from Dashboard” as not done, but Dashboard already supports deletion.
- **Why it matters**
  - Roadmap should reflect current delivered capabilities to avoid duplicate work.
- **Founder approval required**
  - No (Governance doc), unless you want to treat roadmap as strategic.
 - **Status**
   - Resolved in `docs/roadmap/ROADMAP.md` (marked Dashboard deletion as completed).
 
### 2. Spec Descriptions That Do Not Match Current UI Behavior
 
#### docs/specs/dashboard_view.md
- **Mismatch**
  - Spec says projects are ordered by `updated_at` DESC.
  - Current Dashboard query orders by `created_at` DESC.
- **Why it matters**
  - Users may expect “recently edited” ordering; the UI currently shows “newest created” ordering.
- **Founder approval required**
  - No (Spec alignment with current UI behavior).
 - **Status**
   - Resolved in `docs/specs/dashboard_view.md` (updated ordering to `created_at` DESC).
 
#### docs/specs/data_sync.md
- **Mismatch / aspirational behavior**
  - Spec mentions conflict resolution using `updated_at` and remote-vs-local comparison on load.
  - Current implementation is simple insert/update with no conflict-resolution policy.
- **Why it matters**
  - Without accurate spec language, future debugging will assume a non-existent sync mechanism.
- **Founder approval required**
  - No (Spec alignment), but changes to behavior later would require product approval.
 - **Status**
   - Resolved in `docs/specs/data_sync.md` (documented current manual save + insert/update behavior and added a Future Improvement section).
 
#### docs/specs/task_crud.md
- **Mismatch**
  - Spec includes “Dependencies (Optional)”, but dependencies are not used to compute or shift schedules; `dep` exists but is not applied.
- **Why it matters**
  - Prevents false expectations about dependency-driven timeline recalculation.
- **Founder approval required**
  - No (Spec alignment).
 - **Status**
   - Resolved in `docs/specs/task_crud.md` (clarified dependencies are reserved and not enforced in scheduling).
 
#### docs/specs/user_center.md
- **Mismatch**
  - Spec describes a navigable User Center with tabs (Profile/Billing/Security/Usage).
  - Current UI does not include a route or navigation entry for a User Center page.
- **Why it matters**
  - Specs must reflect what users can actually access today.
- **Founder approval required**
  - No (Spec alignment).
 - **Status**
   - Resolved in `docs/specs/user_center.md` (marked as planned feature not currently accessible in UI).
 
### 3. Missing Specs for Important Product Features
 
#### Analytics (Existing UI placeholder)
- **Observation**
  - UI sidebar contains “Analytics” as a disabled item.
- **Missing spec**
  - No spec exists for what Analytics will contain, whether it is MVP or future scope.
- **Recommendation**
  - Add `docs/specs/analytics.md` as a placeholder spec explicitly marked as “Not implemented yet”, to prevent accidental build-out.
- **Founder approval required**
  - No (Spec creation), unless it changes scope commitments.
 
## AI Plan Generation Spec Detection (Part 6)
 
### Current state
- A spec exists as `docs/specs/ai_planner.md` and covers the high-level AI Planner flow.
- A dedicated spec named `docs/specs/ai_plan_generation.md` does not exist.
 
### Proposal: docs/specs/ai_plan_generation.md (New Spec)
If you want clearer separation of concerns, create a dedicated spec file with the following sections:
 
- **Input prompt format**
  - System prompt role (project management expert)
  - User prompt schema constraints (JSON-only, timeline items)
- **API endpoint**
  - `POST /api/generate-plan`
  - Request body `{ idea: string }`
  - Response schema: `{ projectTitle, timeline: [{ task, start, duration }], ... }`
- **Provider abstraction**
  - OpenRouter as gateway
  - Model selection policy (`OPENROUTER_MODELS` priority list and `OPENROUTER_MODEL` fallback; see `api/generate-plan.js`)
- **JSON validation**
  - How markdown fences are handled
  - JSON extraction strategy and parse failure behavior
- **Importing plan into project**
  - Mapping `timeline` weeks to project editor dates
  - Store update behavior (`importPlan`)
- **Error handling**
  - Empty input
  - Provider failures (non-200)
  - Invalid JSON / empty content
  - User-facing error messaging and logging expectations
 
Founder approval required: **No** for creating the spec, **Yes** if it changes scope or commits to new behavior.
 
## Recommended Next Steps
1. Update specs to match current UI behavior (Dashboard ordering, Data Sync, Task dependencies, User Center availability).
2. Decide whether Roadmap is treated as a strategic document (approval required) or a governance doc (can be updated freely).
3. Decide whether to update `docs/strategy/AI_PROJECT_PLANNER_MASTER_CONTEXT.md` now (requires explicit founder approval).
