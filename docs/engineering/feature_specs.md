# Feature Specifications 
 
## 0. Public Landing Page
- **How it works**: Non-authenticated visitors see a 5-section landing page at `/` (Hero, Problem, Solution, Demo, CTA) with interactive demo playback and auth CTA buttons.

## 1. AI Project Generator 
- **How it works**: Users enter an idea and quality controls (template, start date, duration, granularity). The frontend sends them to `/api/generate-plan`, which resolves Free vs Pro rules server-side, calls OpenRouter with one or more LLMs (priority list from `OPENROUTER_MODELS` / `OPENROUTER_MODEL`), receives JSON, and the editor renders a Gantt chart anchored on the chosen start date. See `docs/specs/ai_planner.md`.
 
 ## 2. Project Editor 
 - **How it works**: A manual interface to add, edit, or delete tasks. Changes can be saved to Supabase. 
 
 ## 3. Dashboard 
 - **How it works**: Lists all projects saved by the authenticated user in Supabase. 

## 4. Pricing & Billing Entry
- **How it works**: A protected `/pricing` page reads `profiles.plan_tier` and provides invite-code redemption (`redeem_invite_code`) for Free users to access Pro during promotion.

## 5. Project Export
- **How it works**: In Project Editor, users can export the current project as JSON or Markdown via client-side file generation.

## 6. Internationalization
- **How it works**: Users switch between English and Simplified Chinese via `LanguageSwitcher`; strings live in `src/i18n/messages.js` and `document.documentElement.lang` updates with locale. See `docs/specs/i18n.md`.
