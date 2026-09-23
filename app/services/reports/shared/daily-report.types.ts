export type DailyReportKind = "branch" | "customer-service";

export type DailyReportSection =
  | "summary"
  | "sales"
  | "reservations"
  | "delivered"
  | "cancelled"
  | "received"
  | "stockOut"
  | "allMovements"
  | "stockOperations"
  | "studentOperations"
  | "returns"
  | "exchanges"
  | "refunds";

export type BranchReportSection = Exclude<DailyReportSection, "summary">;

export type CustomerServiceReportSection =
  | "reservations"
  | "delivered"
  | "cancelled"
  | "studentOperations";
