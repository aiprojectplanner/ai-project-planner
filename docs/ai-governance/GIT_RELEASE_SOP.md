# Git / Commit / Release SOP

This document defines the safe Git workflow for this repository.

The purpose is to ensure that AI-assisted development (Trae or other AI tools) follows a predictable and safe process when committing, pushing, and tagging code.

This SOP applies to:
- repository commits
- push operations
- version tagging
- release preparation

AI assistants must follow these rules before modifying repository history.

---

# 1. Repository State Check (Mandatory)

Before performing any commit operation, AI assistants must check the current repository state.

Run the following commands:
- `git status`
- `git branch`
- `git remote -v`

Purpose:
- confirm current branch
- verify repository remote
- review modified and untracked files
- ensure the correct repository is being modified

AI assistants must understand the repository state before staging or committing files.

---

# 2. Security Check (Secrets Protection)

Before staging or committing files, AI assistants must verify that sensitive data will not be committed.

The following must never be committed:
- `.env`
- `.env.local`
- `.env.*`
- API keys
- OpenRouter API keys
- Supabase service role keys
- Vercel secrets
- local credential files
- private configuration files

If any sensitive information is detected, AI assistants must stop and report the issue before proceeding.

---

# 3. Commit Scope Rules

Commits must be logically grouped and clearly described.

Recommended commit prefixes:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation update
- `refactor:` internal code improvement
- `chore:` maintenance or configuration

Examples:
- `feat: upgrade project to new MVP architecture`
- `fix: enforce free plan project limits`
- `docs: update project status documentation`

Commits should represent a clear logical change.

Avoid combining unrelated changes in a single commit.

---

# 4. Safe Commit Procedure

AI assistants must follow this commit procedure.

Step 1
Check repository state.

`git status`

Step 2
Review files that will be staged.

Step 3
Stage only the intended files.

Step 4
Create a commit with a clear message.

Step 5
Show the commit summary.

Step 6
Wait for approval before pushing.

AI assistants must not push automatically.

---

# 5. Push Safety Rules

Before pushing changes to the remote repository, AI assistants must ensure that the local branch is synchronized with the remote branch.

Recommended workflow:

`git pull --rebase`

If conflicts appear, resolve them before continuing.

Then push:

`git push`

Force push must never be used unless explicitly approved.

---

# 6. Version Tagging Rules

Git tags are used to mark stable milestones.

Typical milestones include:
- MVP baseline
- Beta release
- Launch candidate
- Production release

Example tags:
- `v0.1-mvp`
- `v0.2-beta`
- `v1.0-launch`

Suggested tagging workflow:
- `git tag <tag_name>`
- `git push origin <tag_name>`

AI assistants must not create or push tags automatically without approval.

---

# 7. Recommended Workflow for Major Updates

For large feature updates or architectural changes, AI assistants should follow this sequence.

1. Check repository state
- `git status`
- `git branch`
- `git remote -v`

2. Perform security check
- Ensure no secrets or credentials are staged.

3. Stage intended files only

4. Create a clear commit message

5. Show commit summary

6. Wait for approval

7. After approval:
- `git pull --rebase`
- `git push`

8. If milestone is stable, recommend creating a tag.

---

# 8. AI Assistant Behavior Rules

AI assistants must follow these behavioral rules:
- Do not push automatically.
- Do not create tags automatically.
- Do not use force push.
- Do not commit secrets.
- Explain what will be committed before committing.
- Keep commits reversible and understandable.

AI assistants should act conservatively when modifying repository history.

---

# 9. Pre-Commit Checklist

Before performing a commit, AI assistants should generate a short checklist.

Checklist example:
- Current branch
- Modified files
- Files to be staged
- Secrets check result
- Proposed commit message

This checklist must be shown before the commit is created.

---

# 10. Performance and Large Change Sets

When the change set is large (many files, big diffs, or many new docs), AI assistants must optimize the workflow to avoid slow tooling, truncated output, or command hangs.

Recommended practices:
- Do not chain many git commands in a single shell line. Run them as separate steps.
- Prefer summaries over full diffs:
  - `git status --porcelain`
  - `git diff --cached --name-status`
  - `git diff --cached --stat`
- When a full diff is needed, scope it:
  - `git diff --cached -- <path>`
  - `git diff --cached -- <file>`
- Stage by intent using explicit pathspecs (avoid `git add .`):
  - `git add -- <path>`
  - `git add -- <file1> <file2>`
- If a command becomes slow or produces huge output, stop and switch to a summary view before continuing.

---

End of document.
