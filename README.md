# AI Ticket Router

A VS Code extension that transforms Linear tickets into structured, AI-assisted development workflows.

## What it does

AI Ticket Router bridges Linear, Claude Code, and your editor into a focused development workflow. Select the Linear projects you are actively working on, and the extension surfaces only those tickets in a dedicated sidebar. For each ticket, launch specialized AI-driven work phases as isolated Claude Code terminal sessions with tailored prompts.

### Phases

| Phase | Purpose | Output |
|-------|---------|--------|
| **Plan** | Analyze ticket and codebase, produce implementation strategy | `.aitr/{ticketId}/plan.md` |
| **Plan Review** | Critically review the plan for flaws and gaps | `.aitr/{ticketId}/plan-review.md` |
| **Implement** | Execute the approved plan, modify code, run tests | Working tree changes |
| **Code Review** | Review implementation diff in a fresh AI session | `.aitr/{ticketId}/code-review.md` |
| **Bug Hunt** | Aggressively search for edge cases and regressions | `.aitr/{ticketId}/bugs.md` |

Phases are fully à-la-carte — run them in any order, as many times as needed.

## Core principles

- **Session isolation**: each phase runs as a completely fresh Claude Code session with a single, scoped responsibility
- **User-owned git**: the extension never creates branches, commits, or pushes — you stay in control
- **User-owned prompts**: all phase prompts are editable VS Code settings
- **No backend**: runs entirely inside VS Code using the Linear API and local filesystem

## Local development

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [VS Code](https://code.visualstudio.com/) 1.90+

### Setup

```bash
npm install
```

### Run the extension

Press **F5** in VS Code to launch an Extension Development Host.

Then open the Command Palette (`Ctrl+Shift+P`) and run **AI Ticket Router: Hello** to verify the extension loaded correctly.

### Build

```bash
# Development build with watch
npm run watch

# Production build
npm run package

# Type check only
npm run check-types

# Lint
npm run lint
```

### Project structure

```
src/
  extension.ts   # Activation entry point and command registration
  types.ts       # Shared types: LinearProject, LinearTicket, Phase
esbuild.js       # Bundle configuration
.vscode/
  launch.json    # F5 debug configuration
  tasks.json     # Default build task (watch)
```

## License

MIT
