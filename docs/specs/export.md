# Feature: Project Export

## Status
MVP initial implementation.

## Purpose
Allow users to export the currently opened project for sharing, backup, or external editing.

## User Flow
1. User opens a project in **Project Editor**.
2. User clicks an export action in the editor header.
3. System downloads a file to local machine.

## Supported Formats (Current)
- JSON (`.json`)
- Markdown (`.md`)

## Inputs
- Current project data from Zustand store (`projectTitle`, `tasks`, dates).

## Processing Logic
- Export is generated client-side from in-memory project state.
- JSON export serializes project metadata + task list.
- Markdown export renders title + summary + task table.
- File download uses browser `Blob` + temporary object URL.

## Database Tables
- None (read-only from frontend state; no write required).

## Expected Output
- Downloaded file with project content in selected format.

## Error Cases
- Empty project title: fallback filename should still be valid.
- Browser download failure: user-visible alert/error.
