# AI Ticket Router — VS Code Extension

## What this is
A VS Code extension that bridges Linear tickets with isolated Claude Code terminal sessions, organized into discrete dev phases (Plan, Plan Review, Implement, Code Review, Bug Hunt).

## Core Rules (non-negotiable)
- Extension NEVER touches git (no branch creation, commits, switches, pushes)
- Extension NEVER caches Linear tickets long-term — read-through, refresh-on-demand
- All phase prompts are user-editable VS Code settings
- Phases are à-la-carte — no enforced execution order
- Artifacts go to `.aitr/{ticketId}/` inside the workspace

## Architecture
- No backend, no hosted infrastructure
- Linear GraphQL API via `@linear/sdk`
- VS Code SecretStorage for the Linear API key
- VS Code WorkspaceState for selected project IDs and phase status
- Integrated VS Code terminals for Claude Code sessions

## Phases and Artifacts
| Phase       | Artifact                        | Modifies code? |
|-------------|--------------------------------|----------------|
| Plan        | `.aitr/{id}/plan.md`           | No             |
| Plan Review | `.aitr/{id}/plan-review.md`    | No             |
| Implement   | Working tree                   | Yes            |
| Code Review | `.aitr/{id}/code-review.md`    | No             |
| Bug Hunt    | `.aitr/{id}/bugs.md`           | No             |

## Key Files
- `src/extension.ts` — activation entry point, command registration
- `src/types.ts` — shared types: LinearProject, LinearTicket, Phase, PhaseConfig
- `package.json` — extension manifest, commands, views, configuration schema

## Milestones
- **M1**: Auth + project selection + ticket sidebar + Plan phase + terminal execution + artifact
- **M2**: All 5 phases + ticket detail webview + artifact previews + ticket creation
- **M3**: Linear write-back + marketplace publishing
