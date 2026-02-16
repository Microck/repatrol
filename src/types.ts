export type Mode = "demo" | "soak";

export interface RunOptions {
  mode: Mode;
  url: string;
  headless: boolean;
  dryRunGithub: boolean;
  recordVideo: boolean;
  explorerSteps: number;
  chaosDurationSeconds: number;
  artifactsRoot: string;
}

export interface CoverageSummary {
  run_id: string;
  observations: number;
  screens_seen: string[];
  actions_seen: string[];
  first_seen_at: Record<string, string>;
  coverage_percent: number;
  coverage_path: string;
}

export interface BugReport {
  bug_id: string;
  run_id: string;
  title: string;
  severity: "high" | "critical";
  description: string;
  reproduction_steps: string[];
  detected_at: string;
  evidence: {
    screenshot_path?: string;
    video_path?: string;
    page_errors: string[];
  };
}

export interface RunSummary {
  run_id: string;
  mode: Mode;
  target_url: string;
  coverage: CoverageSummary;
  bug_found: boolean;
  bug_path: string | null;
  issue_url: string | null;
  issue_body_path: string | null;
  summary_path: string;
}
