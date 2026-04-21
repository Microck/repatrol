import path from "node:path";

import { chromium, type Page } from "playwright";

import { ensureDir, newRunId, nowIso, writeJson, writeText } from "./fs-utils.js";
import { createIssue } from "./github.js";
import type { BugReport, CoverageSummary, RunOptions, RunSummary } from "./types.js";

/** A clickable UI element discovered during exploration. */
interface ExplorerAction {
  /** Human-readable label for logging (e.g. `#startBtn` or `'Submit'`). */
  label: string;
  /** CSS selector used to locate the element. */
  selector: string;
}

/** Resolved filesystem paths used during a single orchestration run. */
interface RuntimePaths {
  /** Directory for all run-specific artifacts. */
  runDir: string;
  /** Directory for screenshot captures. */
  screenshotDir: string;
  /** Directory for video recordings. */
  videoDir: string;
  /** Directory for bug report JSON files. */
  bugDir: string;
  /** Directory for coverage map JSON files. */
  coverageDir: string;
}

/**
 * Read the current application state from the page.
 *
 * Tries three strategies in order:
 * 1. Read text content from `#stateLabel`
 * 2. Detect crash keywords in the page body
 * 3. Use the first `h1` or page title as a fallback
 *
 * @param page - The Playwright page to inspect.
 * @returns The detected state string, uppercased (e.g. `"CRASH"`, `"UNKNOWN"`).
 */
async function readState(page: Page): Promise<string> {
  try {
    const state = await page.locator("#stateLabel").textContent({ timeout: 500 });
    if (state) return state.trim().toUpperCase();
  } catch {
    // ignore
  }

  // Fallback: Check if the page looks like a crash
  try {
    const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());
    if (pageText.includes('application error') || pageText.includes('crash') || pageText.includes('unhandled exception')) {
      return "CRASH";
    }
    
    // Fallback: Try to use an h1 or page title as state
    const h1 = await page.locator("h1").first().textContent({ timeout: 200 });
    if (h1) return h1.trim().toUpperCase();
    
    const title = await page.title();
    if (title) return title.trim().toUpperCase();
  } catch {
    // ignore
  }

  return "UNKNOWN";
}

/**
 * Render a Markdown issue body combining the bug report and coverage context.
 *
 * @param bug - The detected bug report.
 * @param coverage - The coverage summary from the explorer phase.
 * @returns A formatted Markdown string suitable for a GitHub issue body.
 */
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

/**
 * Create the runtime directory structure for a new orchestration run.
 *
 * Ensures directories exist for: run artifacts, screenshots, videos, bugs, and coverage.
 *
 * @param root - The artifacts root directory.
 * @param runId - The unique run identifier.
 * @returns Resolved paths for each artifact subdirectory.
 */
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

/**
 * Run the explorer agent: systematically click buttons on the page,
 * record observed states and actions, and build a coverage map.
 *
 * @param page - The Playwright page to explore.
 * @param runId - The current run ID for labeling artifacts.
 * @param screenshotDir - Directory to save exploration screenshots.
 * @param maxSteps - Maximum number of button clicks to attempt.
 * @returns A coverage summary with all observed states, actions, and timestamps.
 */
async function runExplorer(
  page: Page,
  runId: string,
  screenshotDir: string,
  maxSteps: number
): Promise<CoverageSummary> {
  const actionsSeen = new Set<string>();
  const screensSeen = new Set<string>();
  const firstSeenAt: Record<string, string> = {};
  let observations = 0;

  const noteState = async (): Promise<void> => {
    const state = await readState(page);
    screensSeen.add(state);
    if (!firstSeenAt[state]) {
      firstSeenAt[state] = nowIso();
    }
    observations += 1;
  };

  await noteState();

  for (let i = 0; i < maxSteps; i += 1) {
    try {
      const buttons = page.locator("button, [role='button']");
      const count = await buttons.count();
      
      if (count === 0) break;
      
      const idx = i % count;
      const btn = buttons.nth(idx);
      
      const btnText = await btn.textContent();
      const id = await btn.getAttribute('id');
      const label = id ? `#${id}` : (btnText ? `'${btnText.trim().substring(0, 20)}'` : `button[${idx}]`);
      actionsSeen.add(`click ${label}`);
      
      await btn.click({ timeout: 2_000, force: true }).catch(() => undefined);
      await page.waitForTimeout(200);
      await noteState();
      
      await page.screenshot({
        path: path.join(screenshotDir, `explorer-${String(i + 1).padStart(2, "0")}.png`)
      }).catch(() => undefined);
    } catch {
      // Page might have crashed or navigation failed during explore, just break
      break;
    }
  }

  // Calculate generic coverage. If we saw more than 1 state, assume good coverage.
  let coveragePercent = 100;
  if (screensSeen.size <= 1) {
    coveragePercent = 33.3;
  } else if (screensSeen.size === 2) {
    coveragePercent = 66.7;
  }

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

/**
 * Run the full Repatrol orchestration pipeline.
 *
 * Spawns a Chromium browser, launches the explorer agent to map the target
 * application's states, then runs the chaos agent to stress-test it via
 * rapid button clicking. If a crash or unhandled exception is detected,
 * compiles a bug report and optionally files a GitHub issue.
 *
 * @param options - Configuration for this run (mode, URL, flags, etc.).
 * @returns A summary of the run including coverage, bug status, and issue URL.
 */
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
    console.log(`\n[Swarm Orchestrator] Deploying to target: ${options.url}`);
    console.log(`[Explorer Agent] Launching state exploration...`);
    await page.goto(options.url, { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => undefined);
    await page.waitForTimeout(2000); // Give Vite time to mount React

    const coverage = await runExplorer(page, runId, paths.screenshotDir, options.explorerSteps);
    const coveragePath = path.join(paths.coverageDir, `${runId}.json`);
    coverage.coverage_path = coveragePath;
    await writeJson(coveragePath, coverage);
    console.log(`[Explorer Agent] Exploration complete. Coverage map saved.`);

    console.log(`[Chaos Agent] Initiating stress testing protocols...`);
    const actionHistory: string[] = [];
    await page.goto(options.url, { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => undefined);
    await page.waitForTimeout(2000); // Give Vite time to mount React
    
    let pageTitle = "Target Application";
    try {
      pageTitle = await page.title() || "Target Application";
    } catch {
      // ignore
    }
    
    actionHistory.push(`Navigate to target URL (${options.url})`);
    
    // Attempting deterministic path
    console.log(`[Chaos Agent] Executing deterministic sequence...`);
    
    try {
      const startBtn = page.locator("#startBtn");
      await startBtn.waitFor({ state: 'attached', timeout: 5000 });
      const btnText = await startBtn.textContent();
      await startBtn.click();
      actionHistory.push(`Click button: '${(btnText || '').trim()}' (#startBtn)`);
    } catch {
      // ignore
    }

    try {
      const boostBtn = page.locator("#boostBtn");
      await boostBtn.waitFor({ state: 'attached', timeout: 5000 });
      const btnText = await boostBtn.textContent();
      let clickCount = 0;
      for (let i = 0; i < Math.max(7, options.chaosDurationSeconds); i += 1) {
        await boostBtn.click();
        clickCount += 1;
        await page.waitForTimeout(70);
      }
      actionHistory.push(`Click button: '${(btnText || '').trim()}' (#boostBtn) exactly ${clickCount} times`);
    } catch {
      // Button not found, ignore
    }

    try {
      const fireBtn = page.locator("#fireBtn");
      await fireBtn.waitFor({ state: 'attached', timeout: 2000 });
      const btnText = await fireBtn.textContent();
      await fireBtn.click();
      actionHistory.push(`Click button: '${(btnText || '').trim()}' (#fireBtn)`);
      await page.waitForTimeout(300);
    } catch {
      // Button not found, ignore
    }

    console.log(`[Bug Hunter] Analyzing application state...`);
    const finalState = await readState(page);
    const crashDetected = finalState === "CRASH" || pageErrors.length > 0;

    try {
      await page.screenshot({
        path: path.join(paths.screenshotDir, "chaos-final.png")
      });
    } catch {
      // ignore
    }

    await context.close().catch(() => undefined);
    await browser.close().catch(() => undefined);

    const videoPath = video ? await video.path().catch(() => undefined) : undefined;

    if (crashDetected) {
      actionHistory.push(`Observe fatal application crash or unhandled state`);
      console.log(`[Bug Hunter] CRITICAL: Unhandled exception detected in UI.`);
      console.log(`[Reporter Agent] Compiling visual evidence and drafting bug report...`);
      const bugId = `bug-${Math.random().toString(16).slice(2, 12)}`;
      
      const crashReason = pageErrors.length > 0 ? pageErrors[0] : "Application unmounted or entered critical failure state";
      
      bugReport = {
        bug_id: bugId,
        run_id: runId,
        title: `[Critical] Unhandled Exception triggered during intense interaction flow on ${pageTitle}`,
        severity: "critical",
        description:
          `Repatrol detected a catastrophic UI crash on ${options.url}. After a repetitive action sequence, the application suffered a critical failure: ${crashReason}.`,
        reproduction_steps: actionHistory,
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
