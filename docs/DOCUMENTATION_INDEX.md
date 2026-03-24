# Documentation Index

This index provides a high-level map of the documentation system for the AI Project Planner repository. It is designed to help AI assistants and developers quickly locate strategy, roadmap, specs, engineering references, and governance rules.

## Strategy Documents
- [docs/strategy/README.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/strategy/README.md): Notes on founder-controlled strategy documents and why they are not committed to the repository.
- `docs/strategy/AI_PROJECT_PLANNER_MASTER_CONTEXT.md`: Founder-controlled strategic memory (stored privately; not committed).
- `docs/strategy/PRODUCT_SCOPE.md`: Founder-controlled product scope and plan definitions (stored privately; not committed).
- `docs/strategy/PRODUCT_PRICING.md`: Founder-controlled pricing policy (stored privately; not committed).

## Product Roadmap
- [ROADMAP.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/roadmap/ROADMAP.md): Phase-based roadmap tracking progress status; AI may update checklist completion only, not strategic direction.

## Feature Specifications
- [ai_planner.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/specs/ai_planner.md): AI planning feature behavior, including request/response expectations and the plan import flow into the editor.
- [dashboard_view.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/specs/dashboard_view.md): Dashboard behavior, including project listing, sorting, and user-visible actions.
- [data_sync.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/specs/data_sync.md): Current data persistence behavior (manual save with insert/update), plus documented future improvements for conflict resolution.
- [export.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/specs/export.md): Project export behavior in the editor (current MVP supports JSON and Markdown downloads).
- [landing_page.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/specs/landing_page.md): Public landing page structure and interactions for acquisition-stage traffic.
- [project_crud.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/specs/project_crud.md): Project creation, loading, saving, and deletion behavior at the feature level.
- [pricing_billing.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/specs/pricing_billing.md): Pricing page behavior, current plan display, and invite-code redemption flow for Pro access during promotion.
- [task_crud.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/specs/task_crud.md): Task creation and editing behavior, including current non-enforcement of dependency scheduling logic.
- [user_auth.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/specs/user_auth.md): Authentication and session behavior from the user’s perspective, aligned to the current `/auth` flow.
- [user_center.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/specs/user_center.md): Planned User Center feature specification; currently not accessible in the UI navigation.

## Engineering Documentation
- [api_spec.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/engineering/api_spec.md): API endpoint definitions and expectations for serverless routes and integration points.
- [database_schema.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/engineering/database_schema.md): Supabase/Postgres schema reference used by the application, including table shapes and key fields.
- [feature_specs.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/engineering/feature_specs.md): High-level engineering feature inventory and pointers to deeper specs.
- [ARCHITECTURE.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/engineering/ARCHITECTURE.md): Technical architecture overview (frontend, serverless API layer, and Supabase integration).
- [TECH_STACK.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/engineering/TECH_STACK.md): Technology stack and implementation details for the current repository.

## AI Governance
- [AI_SYSTEM_CONTEXT.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/ai-governance/AI_SYSTEM_CONTEXT.md): Primary governance and operating instructions for AI assistants (includes strategic document locking rules and debugging workflow requirements).
- [AI_DEV_RULES.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/ai-governance/AI_DEV_RULES.md): AI coding rules, including the small-change principle and English-only policy for commits/PRs/comments.
- [DATABASE_RULES.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/ai-governance/DATABASE_RULES.md): Safety rules for database interactions (Supabase/Postgres), including what is prohibited without explicit approval.
- [DEPLOY_RULES.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/ai-governance/DEPLOY_RULES.md): Deployment and branch safety rules, including testing expectations.
- [BUG_ROOT_CAUSE_WORKFLOW.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/ai-governance/BUG_ROOT_CAUSE_WORKFLOW.md): Mandatory investigation order for debugging, including bug history check requirements.
- [BUG_ANALYSIS_TEMPLATE.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/ai-governance/BUG_ANALYSIS_TEMPLATE.md): Standard template for documenting bug investigations before implementing fixes.
- [BUG_HISTORY.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/ai-governance/BUG_HISTORY.md): Append-only history of important bugs, including root causes and fixes to prevent repeated debugging.
- [DEBUG_LOG.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/ai-governance/DEBUG_LOG.md): Running log of debugging attempts and outcomes to prevent looped investigations.
- [DOC_CONSISTENCY_REPORT.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/ai-governance/DOC_CONSISTENCY_REPORT.md): Snapshot report of documentation mismatches and gaps found during audits.
- [DOCUMENT_REVISION_NOTES.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/ai-governance/DOCUMENT_REVISION_NOTES.md): Ongoing notes of doc inconsistencies and their resolution status.
- [DOCUMENT_REVISION_PLAN.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/ai-governance/DOCUMENT_REVISION_PLAN.md): Plan for future doc improvements and alignment work.
- [STRATEGY_IMPLEMENTATION_AUDIT.md](file:///d:/QS%20Personal/ai-project-planner-dev/docs/ai-governance/STRATEGY_IMPLEMENTATION_AUDIT.md): Audit comparing current implementation against strategy and scope, highlighting gaps and risks.
