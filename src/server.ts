import { createServer, type Server } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

/** Handle returned by {@link startDemoServer} for controlling the demo HTTP server. */
export interface DemoServerHandle {
  /** The base URL where the demo is being served (e.g. `http://127.0.0.1:4173/`). */
  baseUrl: string;
  /** Shut down the server and release the port. */
  close: () => Promise<void>;
}

/** MIME type mapping for common static file extensions. */
const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webm": "video/webm"
};

/**
 * Resolve and sanitize a request path against a root directory.
 *
 * Prevents path-traversal attacks by ensuring the resolved path
 * stays within the given root directory.
 *
 * @param root - Absolute path to the static file root.
 * @param requestPath - The raw URL path from the HTTP request.
 * @returns The resolved absolute file path.
 * @throws Error if the path would escape the root directory.
 */
function sanitizePath(root: string, requestPath: string): string {
  const clean = decodeURIComponent(requestPath.split("?")[0] || "/");
  const relative = clean === "/" ? "index.html" : clean.replace(/^\//, "");
  const fullPath = path.resolve(root, relative);
  if (!fullPath.startsWith(path.resolve(root))) {
    throw new Error("Invalid path");
  }
  return fullPath;
}

/**
 * Start a lightweight HTTP server that serves static files from a directory.
 *
 * Used to serve the demo web game for Playwright testing.
 * Automatically detects the assigned port (supports port 0 for OS-assigned ports).
 *
 * @param directory - Absolute path to the directory to serve.
 * @param host - Bind address (default: `"127.0.0.1"`).
 * @param port - Port number (default: `4173`, use `0` for a random port).
 * @returns A handle with the base URL and a close function.
 */
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

/**
 * Gracefully close an HTTP server, waiting for connections to drain.
 *
 * @param server - The Node.js HTTP server instance.
 * @throws Error if the server fails to close.
 */
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

/**
 * Verify that the demo server is responding with the expected content.
 *
 * @param baseUrl - The base URL to check.
 * @returns `true` if the response contains "Buggy Web Game", `false` otherwise.
 */
export async function checkDemoServer(baseUrl: string): Promise<boolean> {
  const response = await fetch(baseUrl);
  if (!response.ok) {
    return false;
  }
  const html = await response.text();
  return html.includes("Buggy Web Game");
}
