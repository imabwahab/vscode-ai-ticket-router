import * as vscode from "vscode";

export type PromptPhase = "plan" | "planReview" | "implement" | "codeReview" | "bugHunt";

export interface TemplateVars {
  id?: string;
  identifier?: string;
  // Alias for identifier — preserves compatibility with user-customized prompts that use {ticketId}
  ticketId?: string;
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

// Always reads from live VS Code configuration — editing the setting takes
// effect immediately on the next phase run without requiring an extension reload.
export function getPromptTemplate(phase: PromptPhase): string {
  return vscode.workspace.getConfiguration("aitr").get<string>(`prompts.${phase}`) ?? "";
}
