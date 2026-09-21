/**
 * Metric builders for daily report activity boxes (shared sections + role pages).
 */

export const buildBranchActivityMetrics = (summary = {}) => {
  const s = summary || {};
  const undelivered = Number(
    s.undeliveredReservations ??
      Math.max(
        0,
        Number(s.reservations ?? 0) -
          Number(s.deliveredReservations ?? 0) -
          Number(s.cancelledReservations ?? 0),
      ),
  );

  return [
    {
      group: "sales",
      groupLabel: "المبيعات",
      key: "sales",
      label: "المبيعات",
      value: Number(s.sales ?? 0),
    },
    {
      group: "reservations",
      groupLabel: "الحجوزات",
      key: "delivered",
      label: "حجوزات مسلّمة",
      value: Number(s.deliveredReservations ?? 0),
    },
    {
      group: "reservations",
      groupLabel: "الحجوزات",
      key: "undelivered",
      label: "حجوزات لم تستلم",
      value: undelivered,
    },
    {
      group: "reservations",
      groupLabel: "الحجوزات",
      key: "cancelled",
      label: "حجوزات ملغاة",
      value: Number(s.cancelledReservations ?? 0),
    },
    {
      group: "inventory",
      groupLabel: "المخزن",
      key: "received",
      label: "المنتجات المستلمة",
      value: Number(s.receivedQty ?? 0),
    },
    {
      group: "inventory",
      groupLabel: "المخزن",
      key: "stockOut",
      label: "المنتجات المسحوبة",
      value: Number(s.stockOutQty ?? 0),
    },
    {
      group: "inventory",
      groupLabel: "المخزن",
      key: "allMovements",
      label: "حركات المخزن",
      value: Number(s.stockMovements ?? 0),
    },
    {
      group: "returns",
      groupLabel: "المرتجعات والاستبدال",
      key: "returns",
      label: "المرتجعات",
      value: Number(s.returns ?? 0),
    },
    {
      group: "returns",
      groupLabel: "المرتجعات والاستبدال",
      key: "exchanges",
      label: "الاستبدالات",
      value: Number(s.exchanges ?? 0),
    },
  ];
};

export const buildCustomerServiceActivityMetrics = (summary = {}) => {
  const s = summary || {};
  const undelivered = Number(
    s.undeliveredReservations ??
      Math.max(
        0,
        Number(s.reservations ?? 0) -
          Number(s.deliveredReservations ?? 0) -
          Number(s.cancelledReservations ?? 0),
      ),
  );

  return [
    {
      group: "reservations",
      groupLabel: "الحجوزات",
      key: "reservations",
      label: "حجوزات جديدة",
      value: Number(s.reservations ?? 0),
    },
    {
      group: "reservations",
      groupLabel: "الحجوزات",
      key: "delivered",
      label: "حجوزات مسلّمة",
      value: Number(s.deliveredReservations ?? 0),
    },
    {
      group: "reservations",
      groupLabel: "الحجوزات",
      key: "cancelled",
      label: "حجوزات ملغاة",
      value: Number(s.cancelledReservations ?? 0),
    },
    {
      group: "reservations",
      groupLabel: "الحجوزات",
      key: "undelivered",
      label: "لم تُسلّم بعد",
      value: undelivered,
    },
    {
      group: "reservations",
      groupLabel: "الحجوزات",
      key: "ready",
      label: "جاهزة للتسليم",
      value: Number(s.readyReservations ?? 0),
    },
  ];
};

export const buildBranchHeroChips = (summary = {}) => {
  const s = summary || {};
  return [
    {
      key: "collected",
      label: "المحصل",
      value: s.paymentsCollected ?? s.paymentsTotal ?? 0,
      format: "money",
      valueClass: "text-primary-300",
    },
    {
      key: "expenses",
      label: "المصروفات",
      value: s.branchExpenses ?? s.financials?.branchExpenses ?? 0,
      format: "money",
      valueClass: "text-amber-300",
    },
    {
      key: "refunds",
      label: "المسترد",
      value: Number(s.refundsTotal || 0),
      format: "money",
      valueClass: "text-rose-300",
    },
  ];
};

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

