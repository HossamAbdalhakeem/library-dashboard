export const EXCHANGE_DIFF_META = {
  more: {
    title: "الطالب سيدفع فرق سعر إضافي",
    diffLabel: "المبلغ المطلوب تحصيله",
    confirmText: (amount) =>
      `سيتم تحصيل فرق سعر قدره ${Number(amount || 0).toFixed(2)} من الطالب.`,
  },
  less: {
    title: "سيتم رد فرق السعر للطالب",
    diffLabel: "المبلغ الذي سيُرد للطالب",
    confirmText: (amount) =>
      `سيتم رد فرق سعر قدره ${Number(amount || 0).toFixed(2)} للطالب.`,
  },
  same: {
    title: "نفس السعر — لا يوجد فرق مالي",
    diffLabel: "فرق السعر",
    confirmText: () => "السعر متساوٍ ولن يتم تحصيل أو رد أي مبلغ.",
  },
};

export const buildExchangeDiffLabels = (comparison) => {
  const kind = comparison?.kind || "same";
  const meta = EXCHANGE_DIFF_META[kind] || EXCHANGE_DIFF_META.same;
  const amount =
    comparison?.absoluteDifference ?? Math.abs(comparison?.difference || 0);
  return {
    title: meta.title,
    diffLabel: meta.diffLabel,
    confirmText: meta.confirmText(amount),
  };
};
