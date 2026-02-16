import { createServer, type Server } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

export interface DemoServerHandle {
  baseUrl: string;
  close: () => Promise<void>;
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webm": "video/webm"
};

function sanitizePath(root: string, requestPath: string): string {
  const clean = decodeURIComponent(requestPath.split("?")[0] || "/");
  const relative = clean === "/" ? "index.html" : clean.replace(/^\//, "");
  const fullPath = path.resolve(root, relative);
  if (!fullPath.startsWith(path.resolve(root))) {
    throw new Error("Invalid path");
  }
  return fullPath;
}

export async function startDemoServer(
  directory: string,
  host = "127.0.0.1",
  port = 4173
): Promise<DemoServerHandle> {
  const server = createServer(async (req, res) => {
    try {
      const filePath = sanitizePath(directory, req.url || "/");
      const body = await readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      res.statusCode = 200;
      res.setHeader("content-type", MIME[ext] || "application/octet-stream");
      res.end(body);
    } catch {
      res.statusCode = 404;
      res.setHeader("content-type", "text/plain; charset=utf-8");
      res.end("Not found");
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Unable to resolve server address");
  }

  const baseUrl = `http://${host}:${address.port}/`;
  return {
    baseUrl,
    close: () => closeServer(server)
  };
}

export async function closeServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export async function checkDemoServer(baseUrl: string): Promise<boolean> {
  const response = await fetch(baseUrl);
  if (!response.ok) {
    return false;
  }
  const html = await response.text();
  return html.includes("Buggy Web Game");
}
