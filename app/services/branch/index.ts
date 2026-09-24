export { branchApi, branchService } from "./api/branch.api";

export type {
  NamedRef,
  BranchStatus,
  BranchInventoryPreviewItem,
  BranchInventorySummary,
  BranchResponse,
  BranchQuery,
  BranchPayload,
  BranchUpdatePayload,
  BranchStatusPayload,
  BranchInventoryListItem,
  BranchListItem,
} from "./types/branch.types";

export {
  emptyBranchForm,
  mapBranchToForm,
  buildBranchPayload,
  normalizeInventoryPreviewItem,
  normalizeInventoryItem,
  normalizeBranchListItem,
} from "./helpers/branch-form.helper";
