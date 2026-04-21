import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/** Returns the current date-time as an ISO 8601 string. */
export function nowIso(): string {
  return new Date().toISOString();
}

/** Generate a unique run ID from the current timestamp and a random hex suffix. */
export function newRunId(): string {
  const stamp = nowIso().replace(/[-:]/g, "").replace(".", "").replace("T", "-").slice(0, 15);
  const rand = Math.random().toString(16).slice(2, 8);
  return `${stamp}-${rand}`;
}

/** Recursively create a directory (like `mkdir -p`). */
export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

/** Write a JSON-serializable value to a file, creating parent directories as needed. */
export async function writeJson(filePath: string, payload: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
}

/** Write a plain-text string to a file, creating parent directories as needed. */
export async function writeText(filePath: string, text: string): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, text, "utf-8");
}
