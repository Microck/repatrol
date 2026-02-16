import path from "node:path";

import { checkDemoServer, startDemoServer } from "../src/server.js";

interface Args {
  check: boolean;
  port: number;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    check: false,
    port: 4173
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--check") {
      args.check = true;
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
  }
  return args;
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  const gameDir = path.resolve("demo/buggy_web_game");

  if (args.check) {
    const handle = await startDemoServer(gameDir, "127.0.0.1", 0);
    try {
      const ok = await checkDemoServer(handle.baseUrl);
      if (!ok) {
        console.error("ERROR: demo game health check failed");
        return 2;
      }
      console.log("OK: demo game is serveable");
      return 0;
    } finally {
      await handle.close();
    }
  }

  const handle = await startDemoServer(gameDir, "127.0.0.1", args.port);
  console.log(`Serving ${gameDir} on ${handle.baseUrl} (Ctrl+C to stop)`);

  await new Promise<void>((resolve) => {
    const stop = async () => {
      await handle.close();
      resolve();
    };
    process.on("SIGINT", () => {
      void stop();
    });
    process.on("SIGTERM", () => {
      void stop();
    });
  });

  return 0;
}

void main().then((code) => {
  process.exit(code);
});
