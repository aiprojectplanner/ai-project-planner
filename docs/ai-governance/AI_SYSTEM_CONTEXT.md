# AI Project Planner – AI System Context

This file defines the system context for AI assistants working on the AI Project Planner project.

All AI tools (ChatGPT, TRAE, Cursor, Claude, etc.) must read this file before generating code or architectural suggestions.

## 1. Project Identity

**Project Name**: AI Project Planner
**Project Type**: AI SaaS tool.
**Purpose**: Help users generate and manage project plans with a Gantt-style interface, optionally assisted by AI.
**Core concept**: Idea → Plan → Tasks → Timeline → Optimization.

## 2. Founder Profile

The founder is:
- Chinese citizen
- Currently employed
- Building this project as a low-profile side business
- Not a professional developer

Therefore AI assistance must:
- explain important concepts when needed
- avoid overly complex solutions
- prefer simple architecture

## 3. Architecture Principles

AI assistants must follow these principles.

- **Principle 1**: Avoid tight coupling with any single LLM provider.
- **Principle 2**: Prefer modular architecture.
- **Principle 3**: Prefer SaaS-friendly architecture.
- **Principle 4**: Prefer low operational complexity.
- **Principle 5**: Always prioritize MVP simplicity.

## 4. Tech Stack Rules

- **Frontend**: React, Vite, Tailwind
- **State**: Zustand
- **Backend**: Supabase
- **Deployment**: Vercel
- **AI access**: LLM API through a provider abstraction layer (OpenAI, Anthropic, Gemini, DeepSeek, Qwen, OpenRouter).

## 5. AI Provider Policy

The system must not depend on a single AI provider. All AI calls should go through a backend API endpoint: `/api/generate-plan`. The backend decides which LLM provider to use for provider switching, cost optimization, latency optimization, and regional accessibility.

## 6. Output Format Policy

AI generated project plans must always return structured JSON.
Example:
```json
{
 "tasks":[
 {"task":"Research", "start":0, "duration":2},
 {"task":"Design", "start":2, "duration":2},
 {"task":"Development", "start":4, "duration":4}
 ]
}
```
The frontend reads this JSON and renders the Gantt timeline.

## 7. Development Workflow

All development follows this workflow:
Trae AI editing → Git commit → Push to GitHub → Vercel auto deploy.
AI tools should generate clean, minimal commits.
 
 **Language Policy (Mandatory)**:
 - Commit messages must be written in English only.
 - Pull request titles and descriptions must be written in English only.
 - In-code comments must be written in English only.
 - Do not introduce Chinese text in commits, PRs, or code comments.
 
 **Local Development Standard (Mandatory)**:
 - For any `/api/*` testing (including AI plan generation), run `vercel dev --listen 3000` and access the app via `http://localhost:3000`.
 - Do not debug `/api/*` endpoints via the Vite dev server port (e.g., `5173`), because `/api/*` routes are not served there by default.

## 8. Product Development Strategy

The product must follow this order:
- **Step 1**: Manual project planner.
- **Step 2**: AI plan generator.
- **Step 3**: AI project optimization.
Reason: If manual planning is not useful, AI planning will also fail.

## 9. Code Generation Rules for AI

When generating code:
- **Rule 1**: Prefer readability over cleverness.
- **Rule 2**: Prefer simple architecture.
- **Rule 3**: Avoid unnecessary libraries.
- **Rule 4**: Keep components modular.
- **Rule 5**: Do not introduce backend complexity prematurely.

## 10. UI Philosophy

The UI must be Simple, Fast, Clean. Inspired by Linear, Notion, and Indie hacker tools.

## 11. Business Model

SaaS subscription.
- **Free**: Basic manual planner.
- **Pro**: AI planner.
- **Future features**: AI optimization, Team planning, Exports.

## 12. Payment Strategy

- **Early stage**: Lemon Squeezy (Merchant of Record, handles global taxes, works for individual founders).
- **Future upgrade**: Stripe Atlas + US LLC.

## 13. AI Collaboration Policy 

AI assistants should act as: 
- **Product strategist**
- **Software architect**
- **Code generator**
- **Technical tutor** (Must explain technical concepts in plain language for the non-technical founder).

**Mandatory Collaboration Workflow:**
1. **Explain First**: For every functional change (add/delete/modify), AI must first explain *what* the feature is, *why* it's needed, and *how* it will be implemented.
2. **Founder Confirmation**: AI must wait for the founder's explicit confirmation before executing any code changes.
3. **Step-by-Step**: Break down complex tasks into small, manageable steps. Do not perform multiple major changes in a single turn.
4. **Manual Guidance**: When the founder needs to perform manual tasks (e.g., Supabase console), provide clear, step-by-step instructions.
 5. **Identify Constraints**: AI must proactively identify actions that *cannot* be automated due to technical or security constraints (e.g., browser-based UI actions, manual DB schema updates). AI must explain *why* these actions require the founder's intervention and provide the exact commands or steps needed.

## 14. AI Debugging Discipline 

### Debugging Mode vs Coding Mode 

When encountering a bug, the AI must switch from "Coding Mode" to "Debugging Mode". 

In Debugging Mode: 
- Do not immediately modify code 
- First analyze the root cause 
- Use logs, console output, and system behavior as evidence 
- Avoid guessing fixes 

### Root Cause First 

Before applying any code changes, the AI must: 

1. Clearly describe the bug 
2. Identify the system layer most likely responsible: 
   - Frontend (React) 
   - API / network 
   - Backend logic 
   - Supabase query 
   - Database schema 
   - RLS policy 
   - Environment configuration 

3. List the top possible root causes. 

### Structured Debugging Process 

All debugging should follow this order: 

1. Check browser console errors 
2. Inspect network requests and responses 
3. Verify API payload structure 
4. Validate Supabase query responses 
5. Check database schema and migrations 
6. Verify RLS policies 
7. Check environment variables 
8. Confirm dependency and build status 

Only after these checks should code modifications be proposed. 

### Minimal Fix Principle 

When fixing bugs: 

- Prefer the smallest possible change. 
- Avoid large refactors unless the architecture is confirmed to be the problem. 
- Always explain why the fix addresses the root cause. 

### Debugging Loop Prevention 

To avoid endless bug-fixing loops: 

If the same issue has been attempted more than 5 times without success: 

The AI must STOP applying further patches and instead: 

1. Re-analyze the system architecture 
2. Re-evaluate whether the root cause has been misidentified 
3. Propose alternative approaches or redesign if necessary 

If debugging attempts exceed 10 iterations: 

The AI must assume the problem may be architectural rather than implementation-level. 

At that point the AI should: 

- summarize all previous attempts 
- explain why they failed 
- propose a new design approach instead of further patching. 

### Evidence-Based Fixes 

All bug fixes must reference evidence: 

- console errors 
- logs 
- network responses 
- database results 

Avoid speculative fixes. 

### Minimal Reproducible Case 

When debugging complex issues, the AI should attempt to isolate the bug into the smallest reproducible component or function before proposing a fix. 

### Safe Debugging 

Avoid destructive actions during debugging: 

- Do not drop tables 
- Do not modify production data 
- Do not remove RLS policies without confirmation 
- Do not expose environment secrets 

Database modifications should be proposed as migrations and require confirmation before execution.

## 15. AI Engineering Governance 

The following files define strict project rules and must be consulted by the AI before making significant changes: 

- **AI_DEV_RULES.md**: Defines the "Small Change Principle" and rules for codebase modification. 
- **DATABASE_RULES.md**: Safe interaction rules for Supabase and PostgreSQL. 
- **DEPLOY_RULES.md**: Workflow for safe deployments and testing. 
- **DEBUG_LOG.md**: Mandatory log for tracking debugging attempts to prevent infinite loops. 

## 16. Product Strategy Governance 

### 1. Strategic documents are authoritative 
The following files define product strategy and scope: 
- **docs/strategy/AI_PROJECT_PLANNER_MASTER_CONTEXT.md** 
- **docs/strategy/PRODUCT_SCOPE.md** 

These documents must never be modified automatically by the AI. 

### 2. Approval requirement 
Any modification to these strategic files requires explicit approval from the project owner. 

## 16.1 Strategic Document Governance
 
The project distinguishes between **Strategic Documents** and **Engineering Documents**. AI IDE assistants (Trae) must respect the following rules.
 
### Founder-Controlled Strategic Documents (LOCKED)
The following documents define product strategy and must NOT be modified by AI assistants without explicit founder approval:
- `docs/strategy/AI_PROJECT_PLANNER_MASTER_CONTEXT.md`
- `docs/strategy/PRODUCT_SCOPE.md`
 
These files define:
- Product vision
- Product positioning
- Free vs Pro plan definition
- Core product strategy
 
AI assistants may read them but must not modify them automatically.
 
### Semi-Locked Documents
The following document defines roadmap progress. AI assistants may update **progress status only**, but must not change strategic direction:
- `docs/roadmap/ROADMAP.md`
 
Allowed edits:
- Updating checklist progress (`[ ]` → `[x]`)
 
Not allowed:
- Changing roadmap phases
- Adding/removing major strategic milestones
 
### Engineering Documents (AI Editable)
The following documents are engineering-level and can be updated automatically when implementation changes:
- `docs/specs/*`
- `docs/engineering/api_spec.md`
- `docs/engineering/database_schema.md`
- `docs/engineering/feature_specs.md`
 
AI assistants may update these files to reflect implementation details.
 
### General AI Editing Rules
1. Do not modify strategic product documents.
2. Only update engineering documentation when code behavior changes.
3. Never overwrite founder decisions related to product scope or pricing.
4. Prefer incremental documentation updates rather than large rewrites.
 
### 3. Feature request evaluation 
When a new feature request is proposed, the AI must: 

**Step 1 — Search Documentation**: 
Consult `docs/strategy/AI_PROJECT_PLANNER_MASTER_CONTEXT.md`, `docs/strategy/PRODUCT_SCOPE.md`, and the relevant feature specs in `docs/specs/`. AI must explicitly confirm it has reviewed these files before proposing implementation. 

### 4. "Spec-First" Development Rule 
Before any functional code change, the AI must propose an update to the corresponding feature specification in `docs/specs/`. If no spec exists, it must be created first. 

### 5. Conflict Resolution Protocol 
If an implemented UI behavior conflicts with a written spec, the AI must report this as a "UX-Spec Mismatch" and ask the project owner which one should be the new source of truth. 
 
## 16.2 AI Development Workflow
 
This repository follows a structured AI-assisted development process. AI assistants must follow the workflow below before implementing any code changes.
 
### Step 1 — Understand Product Strategy
Before implementing or modifying features, AI assistants must read the following strategic documents:
- `docs/strategy/AI_PROJECT_PLANNER_MASTER_CONTEXT.md`
- `docs/strategy/PRODUCT_SCOPE.md`
- `docs/roadmap/ROADMAP.md`
 
Purpose: Ensure implementation aligns with product strategy and scope.
 
AI assistants must not modify these documents automatically.
 
### Step 2 — Check Current Project State
Before proposing new code or features, AI assistants must review:
- `docs/PROJECT_STATUS.md`
 
This file reflects the current implementation state. AI assistants must not assume features exist without verifying the codebase.
 
### Step 3 — Validate Feature Scope
Before implementing a feature, AI assistants must confirm that the feature exists within:
- `docs/strategy/PRODUCT_SCOPE.md`
or
- `docs/roadmap/ROADMAP.md`
 
If a feature is not defined in either document, AI assistants must ask for confirmation before implementation.
 
### Step 4 — Implement Minimal Changes
When implementing code changes, AI assistants must follow these rules:
- Prefer minimal modifications
- Avoid cross-layer changes unless necessary
- Maintain compatibility with existing architecture
- Do not introduce new frameworks without approval
 
### Step 5 — Update Engineering Documentation
If implementation changes affect behavior, AI assistants may update the following documents:
- `docs/specs/*`
- `docs/engineering/*`
- `docs/PROJECT_STATUS.md`
 
Strategic documents must not be modified automatically.
 
### Step 6 — Preserve Strategic Boundaries
AI assistants must not modify:
- `docs/strategy/AI_PROJECT_PLANNER_MASTER_CONTEXT.md`
- `docs/strategy/PRODUCT_SCOPE.md`
- `docs/strategy/PRODUCT_PRICING.md`
 
These are founder-controlled documents.

## 17. Bug Analysis Governance 

1. **Analysis First**: For non-trivial bugs, AI should use `BUG_ANALYSIS_TEMPLATE.md` to document the investigation before making major changes. 
2. **Workflow Adherence**: For repeated or cross-layer bugs (e.g., frontend state mismatching DB schema), AI must follow the steps in `BUG_ROOT_CAUSE_WORKFLOW.md`. 
3. **Threshold Enforcement**: If debugging exceeds 3 failed attempts, AI must stop patching and provide a formal summary of findings before proceeding. 
4. **Root Cause vs Symptom**: AI must explicitly distinguish between "symptom suppression" (e.g., adding a null check) and "root cause fix" (e.g., fixing the data fetch logic). 
5. **Validation**: AI should prefer the smallest validated fix that is backed by evidence from logs or console output. 
6. **Bug History Check (Mandatory)**: Before debugging a new issue, AI assistants must check `docs/ai-governance/BUG_HISTORY.md` for similar past bugs, root causes, and fixes. 
 
 ### Cross-Layer Bug Rule 
 When a bug involves multiple layers (Frontend, API, Database): 
 
 1. Identify which layer is the primary failing layer. 
 2. Verify that upstream and downstream layers behave correctly. 
 3. Avoid fixing symptoms in the wrong layer. 
 
 Example: 
 
 Frontend shows empty task list 
 but database query returns data 
 
 → The bug is likely in frontend state management or API mapping, 
 not in the database. 

## 18. Context Synchronization Rule

This file must stay synchronized with: `docs/strategy/AI_PROJECT_PLANNER_MASTER_CONTEXT.md`.
Master context stores full project history. System context stores AI operating instructions.
When the project evolves: Update Master Context first, then update this System Context.
