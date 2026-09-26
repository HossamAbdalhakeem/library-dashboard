export type DailyReportKind = "branch";

export type DailyReportSection =
  | "summary"
  | "stockOperations"
  | "studentOperations"
  | "refunds";

export type BranchReportSection = Exclude<DailyReportSection, "summary">;
