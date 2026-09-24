import { getStatusTagMeta } from "~/utils/status-tags/catalog";

export const emptyBranchForm = () => ({
  name: "",
  address: "",
  phone: "",
  isActive: true,
});

export const mapBranchToForm = (branch) => ({
  name: branch?.name || "",
  address: branch?.address || "",
  phone: branch?.phone || "",
  isActive: branch ? branch.status !== "INACTIVE" : true,
});

export const buildBranchPayload = (form) => ({
  name: String(form.name || "").trim(),
  address: form.address?.trim() || undefined,
  phone: form.phone?.trim() || undefined,
});

/** Map lean list preview item (product + physicalQuantity). */
export const normalizeInventoryPreviewItem = (item) => ({
  productId: item.product?.id || item.productId || null,
  productName: item.product?.name || item.productName || "-",
  physicalQuantity: Number(item.physicalQuantity ?? 0),
});

/**
 * Map full inventory row (expand / include_sold) to table fields.
 * Accepts branch inventorySummary items or GET /inventory/:branchId rows.
 */
export const normalizeInventoryItem = (item) => {
  const physicalQuantity = item.physicalQuantity ?? 0;
  const reservedQuantity = item.reservedQuantity ?? 0;
  const availableQuantity =
    item.availableQuantity ??
    Math.max(0, physicalQuantity - reservedQuantity);
  const lowStockThreshold = Number(item.lowStockThreshold ?? 0);
  const isLowStock =
    typeof item.isLowStock === "boolean"
      ? item.isLowStock
      : lowStockThreshold > 0 && availableQuantity <= lowStockThreshold;

  return {
    productId: item.product?.id || item.productId || null,
    productName: item.product?.name || item.productName || "-",
    physicalQuantity,
    reservedQuantity,
    availableQuantity,
    soldQuantity: Number(item.soldQuantity ?? 0),
    lowStockThreshold,
    isLowStock,
  };
};

export const normalizeBranchListItem = (branch) => {
  const meta = getStatusTagMeta("entity", branch.status);
  const summary = branch.inventorySummary || {
    productsCount: 0,
    alertsCount: 0,
    preview: [],
  };
  const inventoryPreview = (summary.preview || []).map(
    normalizeInventoryPreviewItem,
  );

  return {
    id: branch.id,
    name: branch.name || "-",
    address: branch.address || "",
    phone: branch.phone || "",
    status: branch.status,
    statusLabel: meta.label,
    productsCount: Number(summary.productsCount ?? 0),
    alertsCount: Number(summary.alertsCount ?? 0),
    inventoryPreview,
    inventoryItems: [],
    inventoryLoading: false,
  };
};
