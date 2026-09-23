import { formatLowStockNotification } from "~/utils/domain-labels/notification";

/** Map API notification → display fields (nested branch/product only). */
export const normalizeNotificationListItem = (item) => {
  const labels = formatLowStockNotification(item);

  return {
    id: item.id,
    type: item.type,
    createdAt: item.createdAt,
    availableQuantity: item.availableQuantity,
    physicalQuantity: item.physicalQuantity,
    reservedQuantity: item.reservedQuantity,
    threshold: item.threshold,
    branch: item.branch,
    product: item.product,
    title: labels.title,
    message: labels.message,
  };
};
