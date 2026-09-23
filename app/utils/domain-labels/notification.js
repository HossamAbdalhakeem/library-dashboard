export const formatLowStockNotification = (item) => {
  const product = item?.product?.name || "منتج";
  const branch = item?.branch?.name || "—";
  const available = item?.availableQuantity ?? 0;
  const threshold = item?.threshold ?? 0;
  return {
    title: "تنبيه نقص مخزون",
    message: `${product} في فرع ${branch} — المتاح ${available} (حد التنبيه ${threshold})`,
  };
};
