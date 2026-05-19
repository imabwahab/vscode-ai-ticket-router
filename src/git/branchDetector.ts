import { exec } from "child_process";
import * as vscode from "vscode";

// Always resolves — never rejects. Returns null when git is unavailable,
// the workspace is not a repo, or the HEAD is detached.
export function detectCurrentBranch(): Promise<string | null> {
  const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!cwd) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    exec("git rev-parse --abbrev-ref HEAD", { cwd }, (err, stdout) => {
      if (err) {
        resolve(null);
        return;
      }
      const branch = stdout.trim();
      // "HEAD" means detached HEAD state
      resolve(branch === "HEAD" || branch.length === 0 ? null : branch);
    });
  });
}
