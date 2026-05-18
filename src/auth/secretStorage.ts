import * as vscode from "vscode";

const SECRET_KEY = "aitr.linearApiKey";

export class LinearKeyStore {
  constructor(private readonly secrets: vscode.SecretStorage) {}

  async get(): Promise<string | undefined> {
    return this.secrets.get(SECRET_KEY);
  }

  async store(apiKey: string): Promise<void> {
    await this.secrets.store(SECRET_KEY, apiKey);
  }

  async delete(): Promise<void> {
    await this.secrets.delete(SECRET_KEY);
  }

  async exists(): Promise<boolean> {
    const key = await this.secrets.get(SECRET_KEY);
    return key !== undefined && key.length > 0;
  }
}
