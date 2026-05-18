import * as vscode from "vscode";
import { LinearKeyStore } from "./auth/secretStorage";
import { LinearClient } from "./linear/client";

export async function activate(context: vscode.ExtensionContext) {
  const output = vscode.window.createOutputChannel("AITR");
  context.subscriptions.push(output);

  const keyStore = new LinearKeyStore(context.secrets);
  const linearClient = new LinearClient(keyStore, output);

  let isAuthenticated = false;
  try {
    isAuthenticated = await keyStore.exists();
  } catch {
    vscode.window.showWarningMessage(
      "AI Ticket Router: Unable to access secure credential storage. Continuing in an unauthenticated state."
    );
  }
  vscode.commands.executeCommand("setContext", "aitr.authenticated", isAuthenticated);

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
      const selectedProjects = context.globalState.get<string[]>("aitr.selectedProjectIds", []);

      if (selectedProjects.length === 0) {
        vscode.window.showWarningMessage(
          "AI Ticket Router: No projects selected. Use 'Select Projects' first."
        );
        return;
      }

      try {
        const tickets = await linearClient.getProjectTickets(selectedProjects);
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
    vscode.commands.registerCommand("aitr.selectProjects", () =>
      vscode.window.showInformationMessage("AI Ticket Router: Select Projects — coming soon.")
    ),
    vscode.commands.registerCommand("aitr.refreshTickets", () =>
      vscode.window.showInformationMessage("AI Ticket Router: Refresh — coming soon.")
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
