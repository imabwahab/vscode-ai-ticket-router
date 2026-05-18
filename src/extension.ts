import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  vscode.commands.executeCommand("setContext", "aitr.authenticated", false);

  context.subscriptions.push(
    vscode.commands.registerCommand("aitr.hello", () => {
      vscode.window.showInformationMessage("AI Ticket Router is active and ready.");
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
