import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export function nowIso(): string {
  return new Date().toISOString();
}

export function newRunId(): string {
  const stamp = nowIso().replace(/[-:]/g, "").replace(".", "").replace("T", "-").slice(0, 15);
  const rand = Math.random().toString(16).slice(2, 8);
  return `${stamp}-${rand}`;
}

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export async function writeJson(filePath: string, payload: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
}

export async function writeText(filePath: string, text: string): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, text, "utf-8");
}
