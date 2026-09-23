/**
 * Hero chips for customer-service daily report overview.
 */
export const buildCustomerServiceHeroChips = (summary = {}) => {
  const s = summary || {};
  return [
    {
      key: "collected",
      label: "المحصل",
      value: s.paymentsCollected ?? 0,
      format: "money",
      valueClass: "text-primary-300",
    },
    {
      key: "refunds",
      label: "المسترد",
      value: Number(s.refundsTotal || 0),
      format: "money",
      valueClass: "text-rose-300",
    },
    {
      key: "net",
      label: "الصافي",
      value: s.paymentsTotal ?? 0,
      format: "money",
      valueClass: "text-emerald-300",
    },
  ];
};
