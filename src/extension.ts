import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  // Set initial auth state
  vscode.commands.executeCommand("setContext", "aitr.authenticated", false);

  // Stub command registrations — implementations land in feature branches
  const commands: [string, () => void][] = [
    ["aitr.connect",        () => vscode.window.showInformationMessage("AI Ticket Router: Connect to Linear — coming soon.")],
    ["aitr.disconnect",     () => vscode.window.showInformationMessage("AI Ticket Router: Disconnect — coming soon.")],
    ["aitr.selectProjects", () => vscode.window.showInformationMessage("AI Ticket Router: Select Projects — coming soon.")],
    ["aitr.refreshTickets", () => vscode.window.showInformationMessage("AI Ticket Router: Refresh — coming soon.")],
    ["aitr.runPlan",        () => vscode.window.showInformationMessage("AI Ticket Router: Plan phase — coming soon.")],
    ["aitr.runPlanReview",  () => vscode.window.showInformationMessage("AI Ticket Router: Plan Review phase — coming soon.")],
    ["aitr.runImplement",   () => vscode.window.showInformationMessage("AI Ticket Router: Implement phase — coming soon.")],
    ["aitr.runCodeReview",  () => vscode.window.showInformationMessage("AI Ticket Router: Code Review phase — coming soon.")],
    ["aitr.runBugHunt",     () => vscode.window.showInformationMessage("AI Ticket Router: Bug Hunt phase — coming soon.")],
  ];

  for (const [id, handler] of commands) {
    context.subscriptions.push(vscode.commands.registerCommand(id, handler));
  }
}

export function deactivate() {}
