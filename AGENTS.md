# AGENTS.md

## Project Charter (graded deliverable)

`docs/project-charter.md` is graded at the end of the project. Keep it up to date continuously: whenever a decision, scope change, risk, stakeholder, milestone, or team change comes up (in a grilling session, spec, ADR, ticket, or meeting notes), update the matching section and add a row to its change log. Replace template placeholders (`<...>`, `XX`) with real content as it becomes known; never delete sections.

## Agent skills

### Issue tracker

Issues live in GitHub Issues of `patrick-pag/sap-projekt-dt` (via `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
