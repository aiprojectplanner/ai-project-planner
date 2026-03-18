# Versioning Strategy (Internal → MVP → Beta → GA)

This document defines the versioning and iteration strategy for this repository.

It standardizes how versions are named across internal iterations, MVP hardening, beta testing, release candidates, and general availability (GA).

This is a governance policy document. It defines naming and lifecycle semantics; safe Git procedures for committing/pushing/tagging are defined in `docs/ai-governance/GIT_RELEASE_SOP.md`.

---

## 1. Standard: Semantic Versioning (SemVer)

Use Semantic Versioning:

`MAJOR.MINOR.PATCH`

- **MAJOR**: incompatible changes (breaking behavior, API, or data model expectations).
- **MINOR**: backward-compatible feature additions.
- **PATCH**: backward-compatible bug fixes and small improvements.

---

## 2. Pre-release Stages (Internal → Beta → RC)

Pre-release versions use SemVer pre-release identifiers:

`MAJOR.MINOR.PATCH-<stage>.<n>`

Stages:
- `internal`: internal iteration builds (not for external users).
- `alpha`: optional early testing stage (still volatile).
- `beta`: external user testing stage (feature-complete or close; mostly stabilization).
- `rc`: release candidate (release freeze; only critical fixes).

Examples:
- `0.1.0-internal.1`
- `0.3.0-beta.2`
- `1.0.0-rc.1`

GA (public release) versions have no pre-release suffix:
- `1.0.0`

---

## 3. Tag Naming Policy

Git tags must be prefixed with `v`:

- `v0.1.0-internal.1`
- `v0.3.0-beta.1`
- `v1.0.0-rc.1`
- `v1.0.0`

Do not use non-standard tags such as `v0.1-mvp` as the primary tag format.
If needed, milestone names can be used as release titles or notes, not as the version identifier.

---

## 4. Lifecycle Strategy

### 4.1 Internal Iteration (Before MVP)

Use `0.x.y` while the product is rapidly evolving and breaking changes are acceptable.

Recommended pattern:
- Establish a baseline: `0.1.0-internal.1`
- Iterate within the same baseline: `0.1.0-internal.2`, `0.1.0-internal.3`, ...
- If the internal milestone is a substantial feature set, increment MINOR: `0.2.0-internal.1`

### 4.2 MVP Completion

MVP is a milestone definition, not a SemVer keyword.

Recommended approach:
- Keep MVP hardening within a chosen internal minor series (for example `0.3.0-internal.N`).
- When the system is stable enough for external testing, transition to beta (`0.3.0-beta.1`).

### 4.3 Beta Testing

Use `0.x.y-beta.n` while collecting feedback and stabilizing behavior.

Recommended pattern:
- Start beta: `0.3.0-beta.1`
- Fixes and small adjustments: `0.3.0-beta.2`, `0.3.0-beta.3`, ...
- If major beta scope changes, increment MINOR and restart beta counter: `0.4.0-beta.1`

### 4.4 Release Candidate (RC)

Use `1.0.0-rc.n` to freeze scope and only allow critical fixes.

Recommended rules:
- No new features in RC.
- Only bug fixes, performance fixes, and security fixes.

### 4.5 General Availability (GA)

GA releases use stable SemVer versions without suffix:
- `1.0.0` for first production release.

Post-GA:
- Patch releases: `1.0.1`, `1.0.2` for hotfixes.
- Minor releases: `1.1.0`, `1.2.0` for new features.
- Major releases: `2.0.0` for breaking changes.

---

## 5. Bump Rules (When to Increment Major/Minor/Patch)

### PATCH
Increment PATCH for:
- bug fixes
- performance improvements
- documentation-only changes (optional; may also remain within the same version if you only tag release milestones)

### MINOR
Increment MINOR for:
- new user-facing features
- backward-compatible behavior additions
- new endpoints that do not break existing clients

### MAJOR
Increment MAJOR for:
- breaking API or behavior changes
- schema changes that require migrations and are incompatible with old clients
- fundamental changes to core flows that invalidate previous assumptions

---

## 6. Release Readiness Gates (Recommended)

Before creating a release tag (beta/rc/ga), ensure:
- `npm run lint` passes
- `npm run build` passes
- secrets scan passes (`npm run secrets:scan`)
- critical user flows are verified (at minimum: app load, auth flow, AI plan generation, project save/load)

---

## 7. Examples (End-to-End)

### Example timeline
- `v0.1.0-internal.1`: first stable internal baseline
- `v0.1.0-internal.2`: internal fixes
- `v0.2.0-internal.1`: new internal milestone feature set
- `v0.3.0-beta.1`: beta starts
- `v0.3.0-beta.2`: beta fixes
- `v1.0.0-rc.1`: RC freeze
- `v1.0.0`: GA
- `v1.0.1`: hotfix
- `v1.1.0`: post-launch feature release

---

## 8. Approval and Safety

Tag creation and pushing must follow `docs/ai-governance/GIT_RELEASE_SOP.md`.
AI assistants must not create or push tags without explicit approval.
