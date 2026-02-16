import path from "node:path";

import { runOrchestration } from "../src/orchestrator.js";
import type { Mode } from "../src/types.js";
import { startDemoServer } from "../src/server.js";

interface Args {
  mode: Mode;
  serve: boolean;
  port: number;
  headless: boolean;
  dryRunGithub: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    mode: "demo",
    serve: false,
    port: 4173,
    headless: false,
    dryRunGithub: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--mode") {
      const mode = argv[i + 1];
      if (mode === "demo" || mode === "soak") {
        args.mode = mode;
      }
      i += 1;
      continue;
    }
    if (token === "--serve") {
      args.serve = true;
      continue;
    }
    if (token === "--port") {
      const value = Number(argv[i + 1]);
      if (Number.isFinite(value) && value > 0) {
        args.port = value;
      }
      i += 1;
      continue;
    }
    if (token === "--headless") {
      args.headless = true;
      continue;
    }
    if (token === "--dry-run-github") {
      args.dryRunGithub = true;
      continue;
    }
  }

  return args;
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));

  const gameDir = path.resolve("demo/buggy_web_game");
  let server: Awaited<ReturnType<typeof startDemoServer>> | null = null;
  let targetUrl = process.env.TARGET_GAME_URL || `http://127.0.0.1:${args.port}/`;

  if (args.serve) {
    server = await startDemoServer(gameDir, "127.0.0.1", args.port);
    targetUrl = server.baseUrl;
  }

  try {
    const summary = await runOrchestration({
      mode: args.mode,
      url: targetUrl,
      headless: args.headless,
      dryRunGithub: args.dryRunGithub || !Boolean(process.env.GITHUB_TOKEN),
      recordVideo: true,
      explorerSteps: args.mode === "demo" ? 6 : 20,
      chaosDurationSeconds: args.mode === "demo" ? 7 : 15,
      artifactsRoot: path.resolve("artifacts")
    });

    console.log(JSON.stringify(summary, null, 2));
    if (summary.bug_path) {
      console.log(`bug_path=${summary.bug_path}`);
    }
    if (summary.issue_url) {
      console.log(`issue_url=${summary.issue_url}`);
    }
    return 0;
  } finally {
    if (server) {
      await server.close();
    }
  }
}

void main().then((code) => {
  process.exit(code);
});
