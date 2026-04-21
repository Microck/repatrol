/** Supported run mode for the orchestrator. */
export type Mode = "demo" | "soak";

/** Configuration options for a single Repatrol orchestration run. */
export interface RunOptions {
  /** "demo" for quick tests, "soak" for extended stress testing. */
  mode: Mode;
  /** URL of the target web application to test. */
  url: string;
  /** Run Chromium in headless mode. */
  headless: boolean;
  /** If true, skip GitHub issue creation and use a placeholder URL. */
  dryRunGithub: boolean;
  /** Record a video of the browser session. */
  recordVideo: boolean;
  /** Maximum number of explorer steps (clicks) to perform. */
  explorerSteps: number;
  /** Duration in seconds for the chaos/stress-test phase. */
  chaosDurationSeconds: number;
  /** Root directory for storing run artifacts (screenshots, videos, reports). */
  artifactsRoot: string;
}

/** Coverage map summary produced by the explorer agent. */
export interface CoverageSummary {
  /** Unique run identifier. */
  run_id: string;
  /** Total number of state observations recorded. */
  observations: number;
  /** Distinct page states (screens) encountered during exploration. */
  screens_seen: string[];
  /** User actions (clicks) observed during exploration. */
  actions_seen: string[];
  /** ISO timestamp of when each state was first seen. */
  first_seen_at: Record<string, string>;
  /** Estimated coverage percentage based on distinct states. */
  coverage_percent: number;
  /** File path where this coverage JSON was saved. */
  coverage_path: string;
}

/** Structured bug report produced when a crash or failure is detected. */
export interface BugReport {
  /** Unique bug identifier (random hex string). */
  bug_id: string;
  /** ID of the run that discovered this bug. */
  run_id: string;
  /** Short human-readable title for the bug. */
  title: string;
  /** Severity classification — only "high" or "critical" bugs are reported. */
  severity: "high" | "critical";
  /** Detailed description of the observed failure. */
  description: string;
  /** Step-by-step actions that led to the bug. */
  reproduction_steps: string[];
  /** ISO timestamp of when the bug was detected. */
  detected_at: string;
  /** Supporting evidence captured during the run. */
  evidence: {
    /** Path to the screenshot taken at the moment of failure. */
    screenshot_path?: string;
    /** Path to the recorded video of the session. */
    video_path?: string;
    /** Unhandled page errors captured during the run. */
    page_errors: string[];
  };
}

/** Final summary of a completed Repatrol orchestration run. */
export interface RunSummary {
  /** Unique run identifier. */
  run_id: string;
  /** The mode used for this run. */
  mode: Mode;
  /** The URL that was tested. */
  target_url: string;
  /** Coverage summary from the explorer phase. */
  coverage: CoverageSummary;
  /** Whether a bug was found during the run. */
  bug_found: boolean;
  /** Path to the bug report JSON, or null if no bug was found. */
  bug_path: string | null;
  /** URL of the filed GitHub issue, or null if not filed. */
  issue_url: string | null;
  /** Path to the issue body markdown, or null if not filed. */
  issue_body_path: string | null;
  /** Path to the run summary JSON file. */
  summary_path: string;
}
