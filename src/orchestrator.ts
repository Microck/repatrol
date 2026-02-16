import path from "node:path";

import { chromium, type Page } from "playwright";

import { ensureDir, newRunId, nowIso, writeJson, writeText } from "./fs-utils.js";
import { createIssue } from "./github.js";
import type { BugReport, CoverageSummary, RunOptions, RunSummary } from "./types.js";

interface ExplorerAction {
  label: string;
  selector: string;
}

interface RuntimePaths {
  runDir: string;
  screenshotDir: string;
  videoDir: string;
  bugDir: string;
  coverageDir: string;
}

async function readState(page: Page): Promise<string> {
  const state = await page.locator("#stateLabel").textContent();
  return (state || "UNKNOWN").trim().toUpperCase();
}

function renderIssueBody(bug: BugReport, coverage: CoverageSummary): string {
  const lines = [
    "## Repatrol automated bug report",
    "",
    `**Severity:** ${bug.severity}`,
    `**Run ID:** ${bug.run_id}`,
    `**Detected at:** ${bug.detected_at}`,
    "",
    "### Description",
    bug.description,
    "",
    "### Reproduction steps",
    ...bug.reproduction_steps.map((step, index) => `${index + 1}. ${step}`),
    "",
    "### Coverage context",
    `- coverage_percent: ${coverage.coverage_percent}`,
    `- screens_seen: ${coverage.screens_seen.join(", ")}`,
    `- actions_seen: ${coverage.actions_seen.join(", ")}`,
    "",
    "### Evidence",
    `- screenshot: ${bug.evidence.screenshot_path || "n/a"}`,
    `- video: ${bug.evidence.video_path || "n/a"}`,
    `- page_errors: ${bug.evidence.page_errors.join(" | ") || "none"}`
  ];
  return `${lines.join("\n")}\n`;
}

async function ensurePaths(root: string, runId: string): Promise<RuntimePaths> {
  const runDir = path.join(root, "runs", runId);
  const screenshotDir = path.join(root, "screenshots", runId);
  const videoDir = path.join(root, "videos", runId);
  const bugDir = path.join(root, "bugs");
  const coverageDir = path.join(root, "coverage");

  await Promise.all([
    ensureDir(runDir),
    ensureDir(screenshotDir),
    ensureDir(videoDir),
    ensureDir(bugDir),
    ensureDir(coverageDir)
  ]);

  return {
    runDir,
    screenshotDir,
    videoDir,
    bugDir,
    coverageDir
  };
}

async function runExplorer(
  page: Page,
  runId: string,
  screenshotDir: string,
  maxSteps: number
): Promise<CoverageSummary> {
  const actions: ExplorerAction[] = [
    { label: "click START", selector: "#startBtn" },
    { label: "click BOOST", selector: "#boostBtn" },
    { label: "click BACK", selector: "#backBtn" },
    { label: "click START", selector: "#startBtn" },
    { label: "click FIRE", selector: "#fireBtn" },
    { label: "click RESET", selector: "#resetBtn" }
  ];

  const actionsSeen = new Set<string>();
  const screensSeen = new Set<string>();
  const firstSeenAt: Record<string, string> = {};
  let observations = 0;

  const noteState = (state: string): void => {
    screensSeen.add(state);
    if (!firstSeenAt[state]) {
      firstSeenAt[state] = nowIso();
    }
    observations += 1;
  };

  noteState(await readState(page));

  for (let i = 0; i < Math.min(actions.length, maxSteps); i += 1) {
    const action = actions[i];
    actionsSeen.add(action.label);
    await page.locator(action.selector).click({ timeout: 3_000 });
    await page.waitForTimeout(180);
    noteState(await readState(page));
    await page.screenshot({
      path: path.join(screenshotDir, `explorer-${String(i + 1).padStart(2, "0")}.png`),
      fullPage: true
    });
  }

  const knownStates = ["TITLE", "PLAY", "CRASH"];
  const coveragePercent = Number(((screensSeen.size / knownStates.length) * 100).toFixed(2));

  return {
    run_id: runId,
    observations,
    screens_seen: [...screensSeen],
    actions_seen: [...actionsSeen],
    first_seen_at: firstSeenAt,
    coverage_percent: coveragePercent,
    coverage_path: ""
  };
}

export async function runOrchestration(options: RunOptions): Promise<RunSummary> {
  const runId = newRunId();
  const paths = await ensurePaths(options.artifactsRoot, runId);

  const browser = await chromium.launch({ headless: options.headless });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: options.recordVideo
      ? {
          dir: paths.videoDir,
          size: { width: 1280, height: 720 }
        }
      : undefined
  });

  const page = await context.newPage();
  const video = page.video();
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  let bugReport: BugReport | null = null;
  let issueBodyPath: string | null = null;
  let issueUrl: string | null = null;

  try {
    await page.goto(options.url, { waitUntil: "domcontentloaded" });

    const coverage = await runExplorer(page, runId, paths.screenshotDir, options.explorerSteps);
    const coveragePath = path.join(paths.coverageDir, `${runId}.json`);
    coverage.coverage_path = coveragePath;
    await writeJson(coveragePath, coverage);

    await page.goto(options.url, { waitUntil: "domcontentloaded" });
    await page.locator("#startBtn").click();
    for (let i = 0; i < Math.max(7, options.chaosDurationSeconds); i += 1) {
      await page.locator("#boostBtn").click();
      await page.waitForTimeout(70);
    }
    await page.locator("#fireBtn").click();
    await page.waitForTimeout(300);

    const finalState = await readState(page);
    const crashDetected = finalState === "CRASH" || pageErrors.length > 0;

    await page.screenshot({
      path: path.join(paths.screenshotDir, "chaos-final.png"),
      fullPage: true
    });

    await context.close();
    await browser.close();

    const videoPath = video ? await video.path() : undefined;

    if (crashDetected) {
      const bugId = `bug-${Math.random().toString(16).slice(2, 12)}`;
      bugReport = {
        bug_id: bugId,
        run_id: runId,
        title: "Deterministic crash path triggered",
        severity: "critical",
        description:
          "Repatrol detected a deterministic unhandled exception after repetitive BOOST actions followed by FIRE.",
        reproduction_steps: [
          "Open demo/buggy_web_game",
          "Click START",
          "Click BOOST seven times",
          "Click FIRE",
          "Observe crash and page error"
        ],
        detected_at: nowIso(),
        evidence: {
          screenshot_path: path.join(paths.screenshotDir, "chaos-final.png"),
          video_path: videoPath,
          page_errors: pageErrors
        }
      };

      const bugPath = path.join(paths.bugDir, `${bugId}.json`);
      await writeJson(bugPath, bugReport);

      const coveragePayload = JSON.parse(
        await (await import("node:fs/promises")).readFile(path.join(paths.coverageDir, `${runId}.json`), "utf-8")
      ) as CoverageSummary;
      const issueBody = renderIssueBody(bugReport, coveragePayload);
      issueBodyPath = path.join(paths.runDir, "issue_body.md");
      await writeText(issueBodyPath, issueBody);

      if (options.dryRunGithub || !process.env.GITHUB_TOKEN) {
        issueUrl = "https://github.com/owner/repatrol-dry-run/issues/dry-run";
      } else {
        const repo = process.env.GITHUB_REPO || "owner/repatrol";
        issueUrl = await createIssue({
          repo,
          title: bugReport.title,
          body: issueBody,
          token: process.env.GITHUB_TOKEN
        });
      }

      const summaryPath = path.join(paths.runDir, "summary.json");
      const summary: RunSummary = {
        run_id: runId,
        mode: options.mode,
        target_url: options.url,
        coverage: coveragePayload,
        bug_found: true,
        bug_path: bugPath,
        issue_url: issueUrl,
        issue_body_path: issueBodyPath,
        summary_path: summaryPath
      };
      await writeJson(summaryPath, summary);
      return summary;
    }

    const coveragePayload = JSON.parse(
      await (await import("node:fs/promises")).readFile(path.join(paths.coverageDir, `${runId}.json`), "utf-8")
    ) as CoverageSummary;

    const summaryPath = path.join(paths.runDir, "summary.json");
    const summary: RunSummary = {
      run_id: runId,
      mode: options.mode,
      target_url: options.url,
      coverage: coveragePayload,
      bug_found: false,
      bug_path: null,
      issue_url: null,
      issue_body_path: null,
      summary_path: summaryPath
    };
    await writeJson(summaryPath, summary);
    return summary;
  } catch (error) {
    await context.close().catch(() => undefined);
    await browser.close().catch(() => undefined);
    throw error;
  }
}
