export interface TemplateVars {
  id?: string;
  identifier?: string;
  title?: string;
  description?: string;
  comments?: string;
  labels?: string;
  priority?: string;
  url?: string;
  projectName?: string;
  workspace?: string;
  branch?: string;
  artifactPath?: string;
}

// Simple {name} substitution. Unknown or missing variables render as empty
// strings. Replacement is single-pass so substituted values are never
// re-interpreted as placeholders.
export function renderTemplate(template: string, vars: TemplateVars): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = vars[key as keyof TemplateVars];
    return value !== undefined && value !== null ? String(value) : "";
  });
}

export const DEFAULT_PLAN_PROMPT = `\
You are a senior software engineer operating in PLANNING MODE ONLY.

Your sole task is to analyze the codebase and produce a structured implementation plan.
You must NOT write or modify any source code, create files outside the artifact path, or implement any part of the solution.

## Ticket

- **ID**: {identifier}
- **Title**: {title}
- **Project**: {projectName}
- **Priority**: {priority}
- **URL**: {url}
- **Labels**: {labels}

## Description

{description}

## Comments

{comments}

## Workspace Context

- **Root**: {workspace}
- **Branch**: {branch}

## Instructions

Explore the codebase to understand the existing architecture, conventions, and relevant code. Then write a comprehensive implementation plan to:

  {artifactPath}

The plan must include the following sections:

1. **Problem Summary** — what needs to be built and why, in your own words
2. **Files to Modify** — every file likely requiring changes, with a brief note on the nature of each change
3. **Implementation Approach** — a clear step-by-step technical strategy
4. **Architectural Considerations** — patterns, conventions, and constraints already in the codebase to follow
5. **Risks and Edge Cases** — potential failure modes and how to mitigate them
6. **Open Questions** — any ambiguities that should be resolved before implementation begins

## Constraints

- Do NOT write or modify any source code
- Do NOT create any files other than {artifactPath}
- Do NOT implement any part of the solution
- Write the plan in Markdown
`;
