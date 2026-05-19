import * as vscode from "vscode";
import { LinearKeyStore } from "./auth/secretStorage";
import { LinearClient } from "./linear/client";
import { TicketsTreeProvider } from "./providers/ticketsTreeProvider";

const SELECTED_PROJECT_IDS_KEY = "aitr.selectedProjectIds";

export async function activate(context: vscode.ExtensionContext) {
  const output = vscode.window.createOutputChannel("AITR");
  context.subscriptions.push(output);

  const keyStore = new LinearKeyStore(context.secrets);
  const linearClient = new LinearClient(keyStore, output);
  const ticketsProvider = new TicketsTreeProvider();

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("aitr.ticketsView", ticketsProvider)
  );

  // --- Auth state ---
  let isAuthenticated = false;
  try {
    isAuthenticated = await keyStore.exists();
  } catch {
    vscode.window.showWarningMessage(
      "AI Ticket Router: Unable to access secure credential storage. Continuing in an unauthenticated state."
    );
  }
  vscode.commands.executeCommand("setContext", "aitr.authenticated", isAuthenticated);

  // --- Project selection state ---
  const savedIds = context.globalState.get<string[]>(SELECTED_PROJECT_IDS_KEY, []);
  const hasSelectedProjects = savedIds.length > 0;
  vscode.commands.executeCommand("setContext", "aitr.hasSelectedProjects", hasSelectedProjects);

  // Reload saved project data into the tree on startup without blocking activation
  if (isAuthenticated && hasSelectedProjects) {
    linearClient
      .listProjects()
      .then((projects) => {
        const selected = projects.filter((p) => savedIds.includes(p.id));
        ticketsProvider.setSelectedProjects(selected);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        output.appendLine(`[activation] Failed to reload saved projects: ${msg}`);
      });
  }

  // --- Commands ---
  context.subscriptions.push(
    vscode.commands.registerCommand("aitr.hello", () => {
      vscode.window.showInformationMessage("AI Ticket Router is active and ready.");
    }),

    vscode.commands.registerCommand("aitr.setLinearKey", async () => {
      const key = await vscode.window.showInputBox({
        title: "AI Ticket Router: Linear API Key",
        prompt: "Enter your Linear personal API key",
        password: true,
        ignoreFocusOut: true,
        validateInput: (v) => (v.trim().length === 0 ? "API key cannot be empty" : undefined),
      });

      if (key === undefined) {
        return;
      }

      try {
        await keyStore.store(key.trim());
        vscode.commands.executeCommand("setContext", "aitr.authenticated", true);
        vscode.window.showInformationMessage("AI Ticket Router: Linear API key stored successfully.");
      } catch {
        vscode.window.showErrorMessage("AI Ticket Router: Failed to store the API key. Please try again.");
      }
    }),

    vscode.commands.registerCommand("aitr.clearLinearKey", async () => {
      try {
        const exists = await keyStore.exists();

        if (!exists) {
          vscode.window.showWarningMessage("AI Ticket Router: No API key found to remove.");
          return;
        }

        await keyStore.delete();
        vscode.commands.executeCommand("setContext", "aitr.authenticated", false);
        vscode.window.showInformationMessage("AI Ticket Router: Linear API key removed successfully.");
      } catch {
        vscode.window.showErrorMessage("AI Ticket Router: Failed to remove the API key. Please try again.");
      }
    }),

    vscode.commands.registerCommand("aitr.selectProjects", async () => {
      try {
        const projects = await linearClient.listProjects();

        if (projects.length === 0) {
          vscode.window.showInformationMessage(
            "AI Ticket Router: No Linear projects found in your workspace."
          );
          return;
        }

        const currentIds = context.globalState.get<string[]>(SELECTED_PROJECT_IDS_KEY, []);

        const picks = await vscode.window.showQuickPick(
          projects.map((p) => ({
            label: p.name,
            description: p.teamName,
            id: p.id,
            picked: currentIds.includes(p.id),
          })),
          {
            canPickMany: true,
            title: "AI Ticket Router: Select Active Projects",
            placeHolder: "Choose the Linear projects you are working on",
          }
        );

        // undefined means the user dismissed without confirming — preserve the existing selection
        if (picks === undefined) {
          return;
        }

        const selectedIds = picks.map((p) => p.id);
        await context.globalState.update(SELECTED_PROJECT_IDS_KEY, selectedIds);

        const hasProjects = selectedIds.length > 0;
        vscode.commands.executeCommand("setContext", "aitr.hasSelectedProjects", hasProjects);

        const selectedProjects = projects.filter((p) => selectedIds.includes(p.id));
        ticketsProvider.setSelectedProjects(selectedProjects);

        if (hasProjects) {
          vscode.window.showInformationMessage(
            `AI Ticket Router: ${selectedIds.length} project${selectedIds.length === 1 ? "" : "s"} selected.`
          );
        } else {
          vscode.window.showInformationMessage(
            "AI Ticket Router: No projects selected. Ticket view cleared."
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`AI Ticket Router: ${message}`);
      }
    }),

    vscode.commands.registerCommand("aitr.refreshTickets", async () => {
      const selectedIds = context.globalState.get<string[]>(SELECTED_PROJECT_IDS_KEY, []);

      if (selectedIds.length === 0) {
        vscode.window.showInformationMessage(
          "AI Ticket Router: No projects selected. Run 'Select Projects' first."
        );
        return;
      }

      try {
        const projects = await linearClient.listProjects();
        const selected = projects.filter((p) => selectedIds.includes(p.id));
        ticketsProvider.setSelectedProjects(selected);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`AI Ticket Router: ${message}`);
      }
    }),

    vscode.commands.registerCommand("aitr.debugFetchProjects", async () => {
      output.show(true);
      try {
        const projects = await linearClient.listProjects();
        output.appendLine("=== Projects ===");
        for (const p of projects) {
          output.appendLine(`  [${p.state}] ${p.name} (${p.teamName}) — ${p.id}`);
        }
        output.appendLine(`=== Total: ${projects.length} ===`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`AI Ticket Router: ${message}`);
      }
    }),

    vscode.commands.registerCommand("aitr.debugFetchTickets", async () => {
      output.show(true);
      try {
        const projects = await linearClient.listProjects();
        const picks = await vscode.window.showQuickPick(
          projects.map((p) => ({ label: p.name, description: p.teamName, id: p.id })),
          { canPickMany: true, title: "Select projects to fetch tickets from" }
        );

        if (!picks || picks.length === 0) {
          return;
        }

        const tickets = await linearClient.getProjectTickets(picks.map((p) => p.id));
        output.appendLine("=== Tickets ===");
        for (const t of tickets) {
          output.appendLine(`  [${t.state.name}] ${t.identifier}: ${t.title}`);
          output.appendLine(`    Project: ${t.projectName} | Priority: ${t.priority} | Labels: ${t.labels.join(", ") || "none"}`);
          output.appendLine(`    ${t.url}`);
        }
        output.appendLine(`=== Total: ${tickets.length} ===`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`AI Ticket Router: ${message}`);
      }
    }),

    vscode.commands.registerCommand("aitr.connect", () =>
      vscode.window.showInformationMessage("AI Ticket Router: Connect to Linear — coming soon.")
    ),
    vscode.commands.registerCommand("aitr.disconnect", () =>
      vscode.window.showInformationMessage("AI Ticket Router: Disconnect — coming soon.")
    ),
    vscode.commands.registerCommand("aitr.runPlan", () =>
      vscode.window.showInformationMessage("AI Ticket Router: Plan phase — coming soon.")
    ),
    vscode.commands.registerCommand("aitr.runPlanReview", () =>
      vscode.window.showInformationMessage("AI Ticket Router: Plan Review phase — coming soon.")
    ),
    vscode.commands.registerCommand("aitr.runImplement", () =>
      vscode.window.showInformationMessage("AI Ticket Router: Implement phase — coming soon.")
    ),
    vscode.commands.registerCommand("aitr.runCodeReview", () =>
      vscode.window.showInformationMessage("AI Ticket Router: Code Review phase — coming soon.")
    ),
    vscode.commands.registerCommand("aitr.runBugHunt", () =>
      vscode.window.showInformationMessage("AI Ticket Router: Bug Hunt phase — coming soon.")
    )
  );
}

export function deactivate() {}
