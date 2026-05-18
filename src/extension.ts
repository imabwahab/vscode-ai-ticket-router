import * as vscode from "vscode";
import { LinearKeyStore } from "./auth/secretStorage";

export async function activate(context: vscode.ExtensionContext) {
  const keyStore = new LinearKeyStore(context.secrets);

  const isAuthenticated = await keyStore.exists();
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
      const exists = await keyStore.exists();

      if (!exists) {
        vscode.window.showWarningMessage("AI Ticket Router: No API key found to remove.");
        return;
      }

      try {
        await keyStore.delete();
        vscode.commands.executeCommand("setContext", "aitr.authenticated", false);
        vscode.window.showInformationMessage("AI Ticket Router: Linear API key removed successfully.");
      } catch {
        vscode.window.showErrorMessage("AI Ticket Router: Failed to remove the API key. Please try again.");
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
