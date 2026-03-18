# Strategy vs Implementation Audit
 
This document compares the current, confirmed product behavior (source of truth) against stated product strategy and scope. It highlights gaps, mismatches, and prioritized recommendations.
 
## Sources of Truth
- Current UI and code behavior in `src/` and `api/`
 
## Strategy References (Non-authoritative during audit)
- `docs/strategy/AI_PROJECT_PLANNER_MASTER_CONTEXT.md` (strategic history; requires explicit approval to modify)
- `docs/strategy/PRODUCT_SCOPE.md`
- `docs/roadmap/ROADMAP.md`
- `docs/ai-governance/AI_SYSTEM_CONTEXT.md`
 
## Current Implementation Snapshot
 
### Implemented
- Auth (Supabase) with protected routes
  - `src/pages/Auth.jsx`
  - `src/store/authStore.js`
  - `src/App.jsx`
- Dashboard project list with delete
  - Sort: `created_at` DESC
  - `src/pages/Dashboard.jsx`
- Manual project editor with task CRUD and manual save (insert/update)
  - `src/pages/ProjectEditor.jsx`
  - `src/store/projectStore.js`
- AI plan generation (Idea → JSON → Import → Save → Editor)
  - `src/pages/AIPlanner.jsx`
  - `api/generate-plan.js`
 
### Partially Implemented
- Free plan project limit (3)
  - UI gating exists on Dashboard create button
  - Not enforced at database or save path
  - `src/pages/Dashboard.jsx`
 
### Not Implemented / Placeholder
- Project renaming from Dashboard
  - `docs/roadmap/ROADMAP.md`
- Analytics
  - UI nav placeholder only
  - `src/App.jsx`
- User Center
  - Spec exists but feature is not accessible in current UI routing
  - `docs/specs/user_center.md`
- Subscription / billing integration (Lemon Squeezy)
  - `docs/strategy/PRODUCT_SCOPE.md`
  - `docs/roadmap/ROADMAP.md`
- Exports (PDF/Markdown/Image)
  - `docs/strategy/PRODUCT_SCOPE.md`
  - `docs/roadmap/ROADMAP.md`
- Multi-language (i18n)
  - Mentioned historically but not present in code
  - `docs/strategy/AI_PROJECT_PLANNER_MASTER_CONTEXT.md`
 
## Key Gaps and Risks
 
### 1) Monetization mismatch: “AI Planner (Pro)” is not gated
- Strategy: AI planner is positioned as Pro.
- Current behavior: Any authenticated user can use AI Planner.
- Risk: Paid differentiation is unclear; difficult to validate subscription funnel.
 
### 2) Free plan enforcement mismatch: 3-project limit is UI-only
- Strategy: Free users limited to 3 projects.
- Current behavior: Dashboard blocks “New Project” locally, but other creation/save paths may bypass.
- Risk: Limit can be circumvented; policy is not enforceable.
 
### 3) Strategic history mismatch (Master Context is stale)
- `docs/strategy/AI_PROJECT_PLANNER_MASTER_CONTEXT.md` references a stack that does not match the current repository state.
- Risk: Future decisions and AI assistance can be misled.
- Governance: Do not update without explicit founder approval.
 
## Recommended Next Steps (Priority)
 
### P0 — Enforce plan limits and Pro gating consistently
- Define a single authoritative enforcement layer for:
  - Free plan project limit (3)
  - AI Planner Pro gating
- Recommendation: implement enforcement at the persistence boundary (save/insert) rather than only at UI button level.
 
### P1 — Clarify roadmap items that are partially delivered
- Confirm which items are considered complete:
  - Dashboard deletion is already implemented.
  - Rename remains missing.
 
### P2 — Stabilize “future scope” placeholders
- Analytics: create a placeholder spec that explicitly states “not implemented”.
- User Center: keep spec marked as planned until a route is added.
 
### P3 — Decide i18n timing
- Either commit it to Phase 2 (with a spec and library choice) or remove it from near-term expectations.
 
## Approval Notes
- Updating `docs/strategy/AI_PROJECT_PLANNER_MASTER_CONTEXT.md` requires explicit founder approval.
- Updating `docs/strategy/PRODUCT_SCOPE.md` or other strategic documents should follow the governance approval rule.
