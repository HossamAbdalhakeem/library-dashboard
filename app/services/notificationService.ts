import { apiFetch, asList } from "~/utils/apiFetch";

const normalizeNotification = (item: Record<string, any> = {}) => {
  const createdAt = item.createdAt || item.created_at || item.timestamp || null;

  return {
    ...item,
    id: item.id || item._id || `${item.type || "n"}-${createdAt || Math.random()}`,
    title: item.title || item.subject || "تنبيه مخزون",
    message:
      item.message ||
      item.body ||
      item.content ||
      item.description ||
      "يوجد تحديث بخصوص المخزون.",
    type: String(item.type || item.kind || "STOCK").toUpperCase(),
    createdAt,
    productId: item.productId || item.product_id || item.product?.id || null,
    productName: item.productName || item.product_name || item.product?.name || "",
    branchId: item.branchId || item.branch_id || item.branch?.id || null,
    branchName: item.branchName || item.branch_name || item.branch?.name || "",
    availableQuantity: item.availableQuantity ?? item.available_quantity ?? null,
    threshold: item.threshold ?? item.lowStockThreshold ?? null,
  };
};

export const notificationService = {
  async getNotifications(params: Record<string, any> = {}) {
    const list = asList(
      await apiFetch("/notifications", { method: "GET", params }),
    );
    return list.map((item) => normalizeNotification(item || {}));
  },
};
