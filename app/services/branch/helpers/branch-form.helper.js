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

/** Map nested inventory summary item from API. */
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
    productId: item.product?.id || null,
    productName: item.product?.name || "-",
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
    items: [],
  };
  const items = (summary.items || summary.preview || []).map(
    normalizeInventoryItem,
  );

  return {
    id: branch.id,
    name: branch.name || "-",
    address: branch.address || "",
    phone: branch.phone || "",
    status: branch.status,
    statusLabel: meta.label,
    productsCount: Number(summary.productsCount ?? items.length),
    alertsCount: Number(summary.alertsCount ?? 0),
    inventoryPreview: (summary.preview || items.slice(0, 3)).map(
      normalizeInventoryItem,
    ),
    inventoryItems: items,
  };
};
