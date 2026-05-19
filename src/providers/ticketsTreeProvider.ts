import * as vscode from "vscode";
import { ProjectData } from "../linear/client";

export class ProjectTreeItem extends vscode.TreeItem {
  constructor(readonly project: ProjectData) {
    super(project.name, vscode.TreeItemCollapsibleState.None);
    this.description = project.teamName;
    this.tooltip = `${project.name} · ${project.teamName} · ${project.state}`;
    this.iconPath = new vscode.ThemeIcon("repo");
    this.contextValue = "aitrProject";
  }
}

export class TicketsTreeProvider implements vscode.TreeDataProvider<ProjectTreeItem> {
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private selectedProjects: ProjectData[] = [];

  setSelectedProjects(projects: ProjectData[]): void {
    this.selectedProjects = projects;
    this._onDidChangeTreeData.fire();
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ProjectTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): ProjectTreeItem[] {
    return this.selectedProjects.map((p) => new ProjectTreeItem(p));
  }
}
