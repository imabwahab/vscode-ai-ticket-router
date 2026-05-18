export interface LinearProject {
  id: string;
  name: string;
  description?: string;
}

export interface LinearTicket {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  state: {
    name: string;
    type: string;
  };
  priority: number;
  assignee?: {
    name: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
  };
  url: string;
}

export type Phase = "plan" | "planReview" | "implement" | "codeReview" | "bugHunt";

export interface PhaseConfig {
  id: Phase;
  label: string;
  artifact: string;
  allowsCodeChanges: boolean;
}

export const PHASES: PhaseConfig[] = [
  { id: "plan",        label: "Plan",        artifact: "plan.md",         allowsCodeChanges: false },
  { id: "planReview",  label: "Plan Review", artifact: "plan-review.md",  allowsCodeChanges: false },
  { id: "implement",   label: "Implement",   artifact: "",                allowsCodeChanges: true  },
  { id: "codeReview",  label: "Code Review", artifact: "code-review.md",  allowsCodeChanges: false },
  { id: "bugHunt",     label: "Bug Hunt",    artifact: "bugs.md",         allowsCodeChanges: false },
];
