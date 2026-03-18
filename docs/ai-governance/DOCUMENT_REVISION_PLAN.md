# Document Revision Plan

This plan outlines the necessary updates to align project documentation with the current repository state, confirmed UI/UX behavior, and strategic goals.

## Priority 1: High Impact / Technical Alignment
*Critical fixes to ensure AI agents understand the current architecture and basic features.*

### 1. Fix Architecture & Tech Stack Mismatch
- **Files**: `docs/engineering/TECH_STACK.md`, `docs/engineering/ARCHITECTURE.md`
- **Why**: Currently incorrectly lists "Next.js". Must be updated to **React + Vite + Supabase**.
- **User Approval**: Required (to confirm tech stack finality).

### 2. Formalize AI Generation Flow
- **New File**: `docs/specs/ai_planner.md`
- **Why**: AI generation is a core Pro feature but currently lacks a detailed specification. Needs to define the prompt template, JSON parsing/cleaning logic, and the "Import to Editor" flow.
- **User Approval**: Required (to confirm AI logic and prompt design).

### 3. Align Auth Spec with UI
- **File**: `docs/specs/user_auth.md`
- **Why**: Current spec is generic. Needs to reflect the actual `/auth` page behavior (unified login/register toggle) and the Zustand-based session management.
- **User Approval**: Not required (alignment with existing UI).

## Priority 2: Strategy & Scope Alignment
*Aligning the vision with the implemented reality and planning for Phase 1.*

### 1. Update Product Scope & Roadmap
- **Files**: `docs/strategy/PRODUCT_SCOPE.md`, `docs/roadmap/ROADMAP.md`
- **Why**: Currently contains template placeholders. Needs to incorporate details from `docs/strategy/AI_PROJECT_PLANNER_MASTER_CONTEXT.md` (e.g., 3-project limit, AI optimization).
- **User Approval**: **MANDATORY** (Strategic documents).

### 2. Strengthen Governance Rules
- **File**: `docs/ai-governance/AI_SYSTEM_CONTEXT.md`
- **Why**: Strengthen the "Search First" rule. AI must explicitly confirm it has read the relevant `specs/` before proposing changes.
- **User Approval**: Required.

### 3. Add User Center Spec
- **New File**: `docs/specs/user_center.md`
- **Why**: The UI has a "User Center" (Profile, Billing, Security) that is currently implemented but not documented in specs.
- **User Approval**: Not required (alignment with existing UI).

## Summary of Files to Update

| File | Type | Reason | Approval |
| :--- | :--- | :--- | :--- |
| `TECH_STACK.md` | Governance | Fix Next.js -> Vite mismatch | Yes |
| `ARCHITECTURE.md` | Governance | Define React/Zustand structure | Yes |
| `PRODUCT_SCOPE.md` | Strategic | Replace placeholders with real goals | Yes |
| `ROADMAP.md` | Strategic | Define Phase 1 vs Phase 2 goals | Yes |
| `user_auth.md` | Spec | Align with actual Auth UI | No |
| `project_crud.md` | Spec | Define "upsert" and limit logic | No |
| `ai_planner.md` | Spec (New) | Define AI generation logic | Yes |
| `user_center.md` | Spec (New) | Document Profile/Billing UI | No |

## Proposed Governance Rule Improvements

1.  **"Spec-First" Development**: Before any functional code change, the AI must propose an update to the corresponding `.md` file in `docs/specs/`.
2.  **Strategic authoritative lock**: Explicitly state in `docs/ai-governance/AI_SYSTEM_CONTEXT.md` that `docs/strategy/AI_PROJECT_PLANNER_MASTER_CONTEXT.md` and `docs/strategy/PRODUCT_SCOPE.md` are "Read-Only" for the AI unless a "Strategy Revision" is explicitly requested.
3.  **Conflict Resolution Protocol**: If an implemented UI behavior conflicts with a written spec, the AI must report this as a "UX-Spec Mismatch" and ask which one should be the new source of truth.
