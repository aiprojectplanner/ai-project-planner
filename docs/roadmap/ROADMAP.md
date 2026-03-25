# Product Roadmap 
 
 ## Phase 1: Core Foundation (Current) 
 - [x] React + Vite + Zustand frontend migration. 
 - [x] Supabase Auth & Database integration. 
 - [x] Manual Gantt Editor core functionality. 
 - [x] AI Project Generation flow (Idea → JSON → Import). 
 - [x] Enforcement of the 3-project limit for free accounts (client insert check; apply `supabase/migrations/20260324_enforce_free_project_limit.sql` on Supabase for DB-level RLS). 
 - [x] Project deletion from Dashboard. 
- [x] Project renaming from Dashboard. 
 
 ## Phase 2: Growth & Monetization 
 - [ ] Subscription integration (Lemon Squeezy). 
 - [ ] User onboarding walkthrough for new founders. 
 - [x] Multi-language (i18n) support for global markets (English + Simplified Chinese; see `docs/specs/i18n.md`). 
 - [ ] Task dependencies and automated timeline shifting. 
 
 ## Phase 3: AI Intelligence 
 - [ ] AI Risk Analysis: Identify potential project delays. 
 - [ ] AI Resource Estimator: Suggest team size or budget based on tasks. 
- [ ] Export to PDF/Markdown/Image. 
