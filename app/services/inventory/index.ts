export { inventoryApi, inventoryService } from "./api/inventory.api";

export type {
  NamedRef,
  AcademicYearRef,
  InventoryProductResponse,
  InventoryResponse,
  InventorySummaryPreviewItem,
  InventorySummaryResponse,
  StockMovementResponse,
  StockMutationResponse,
  InventoryAvailability,
  InventoryQuery,
  StockQuantityPayload,
  InventoryListItem,
} from "./types/inventory.types";

export {
  normalizeInventoryListItem,
  normalizeInventorySummary,
  normalizeInventorySummaryPreview,
  mapInventoryProductOption,
  mapInventoryProductOptions,
  normalizeStockMovement,
} from "./helpers/inventory-list.helper";
