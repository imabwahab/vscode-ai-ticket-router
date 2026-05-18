import { LinearClient as LinearSdkClient } from "@linear/sdk";
import * as vscode from "vscode";
import { LinearKeyStore } from "../auth/secretStorage";

export interface ProjectData {
  id: string;
  name: string;
  teamName: string;
  state: string;
}

export interface TicketData {
  id: string;
  identifier: string;
  title: string;
  description: string | undefined;
  priority: number;
  url: string;
  state: { name: string; type: string };
  projectId: string;
  projectName: string;
  labels: string[];
  comments: Array<{ body: string; author: string }>;
}

const EXCLUDED_STATE_TYPES = ["completed", "cancelled"];

export class LinearClient {
  constructor(
    private readonly keyStore: LinearKeyStore,
    private readonly output: vscode.OutputChannel
  ) {}

  private log(message: string): void {
    this.output.appendLine(`[${new Date().toISOString()}] ${message}`);
  }

  private async getSdkClient(): Promise<LinearSdkClient> {
    const key = await this.keyStore.get();
    if (!key) {
      throw new Error(
        'No Linear API key found. Run "AI Ticket Router: Set Linear API Key" to get started.'
      );
    }
    return new LinearSdkClient({ apiKey: key });
  }

  private toUserMessage(context: string, err: unknown): string {
    const raw = err instanceof Error ? err.message : String(err);

    if (raw.includes("No Linear API key")) {
      return raw;
    }
    if (/401|403|unauthorized|authentication required/i.test(raw)) {
      return 'Linear API key is invalid or has been revoked. Run "AI Ticket Router: Set Linear API Key" to update it.';
    }
    if (/ENOTFOUND|ECONNREFUSED|ETIMEDOUT|network/i.test(raw)) {
      return "Failed to reach the Linear API. Check your internet connection and try again.";
    }
    return `Linear GraphQL query failed in ${context}: ${raw}`;
  }

  async listProjects(): Promise<ProjectData[]> {
    this.log("listProjects: request started");
    try {
      const sdk = await this.getSdkClient();
      const projects: ProjectData[] = [];

      let cursor: string | undefined;
      do {
        const page = await sdk.projects({ includeArchived: false, first: 100, after: cursor });
        for (const project of page.nodes) {
          const teams = await project.teams();
          projects.push({
            id: project.id,
            name: project.name,
            teamName: teams.nodes[0]?.name ?? "Unknown Team",
            state: project.state,
          });
        }
        cursor = page.pageInfo.hasNextPage ? (page.pageInfo.endCursor ?? undefined) : undefined;
      } while (cursor !== undefined);

      this.log(`listProjects: returned ${projects.length} project(s)`);
      return projects;
    } catch (err) {
      const userMessage = this.toUserMessage("listProjects", err);
      this.log(`listProjects: error — ${userMessage}`);
      throw new Error(userMessage);
    }
  }

  // Ticket retrieval is intentionally project-scoped. There is no
  // global or unscoped equivalent — this enforces the core product rule.
  async getProjectTickets(projectIds: string[]): Promise<TicketData[]> {
    this.log(`getProjectTickets: request started for ${projectIds.length} project(s)`);
    try {
      const sdk = await this.getSdkClient();
      const tickets: TicketData[] = [];

      for (const projectId of projectIds) {
        this.log(`getProjectTickets: fetching project ${projectId}`);

        let cursor: string | undefined;
        do {
          const page = await sdk.issues({
            first: 100,
            after: cursor,
            filter: {
              project: { id: { eq: projectId } },
              state: { type: { nin: EXCLUDED_STATE_TYPES } },
            },
          });

          for (const issue of page.nodes) {
            const [state, project, labelConn, commentConn] = await Promise.all([
              issue.state,
              issue.project,
              issue.labels(),
              issue.comments(),
            ]);

            const comments = await Promise.all(
              commentConn.nodes.map(async (c) => ({
                body: c.body,
                author: (await c.user)?.name ?? "Unknown",
              }))
            );

            tickets.push({
              id: issue.id,
              identifier: issue.identifier,
              title: issue.title,
              description: issue.description ?? undefined,
              priority: issue.priority,
              url: issue.url,
              state: {
                name: state?.name ?? "Unknown",
                type: state?.type ?? "unknown",
              },
              projectId: project?.id ?? projectId,
              projectName: project?.name ?? "Unknown",
              labels: labelConn.nodes.map((l) => l.name),
              comments,
            });
          }

          cursor = page.pageInfo.hasNextPage ? (page.pageInfo.endCursor ?? undefined) : undefined;
        } while (cursor !== undefined);
      }

      this.log(`getProjectTickets: returned ${tickets.length} ticket(s) across ${projectIds.length} project(s)`);
      return tickets;
    } catch (err) {
      const userMessage = this.toUserMessage("getProjectTickets", err);
      this.log(`getProjectTickets: error — ${userMessage}`);
      throw new Error(userMessage);
    }
  }
}
