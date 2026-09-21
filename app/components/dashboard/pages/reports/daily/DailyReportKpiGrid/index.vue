<template>
  <div>
    <p class="mb-3 text-sm font-semibold text-slate-300">التفاصيل السريعة</p>
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <DailyReportKpiCard
        v-for="card in cards"
        :key="card.key"
        :label="card.label"
        :value="card.value"
        :hint="card.hint"
        :icon="card.icon"
        :clickable="card.clickable"
        :border-class="card.borderClass"
        :icon-wrap-class="card.iconWrapClass"
        :glow-class="card.glowClass"
        @select="$emit('open-detail', card.key)"
      />
    </div>
  </div>
</template>

<script setup>
import DailyReportKpiCard from "./partials/DailyReportKpiCard.vue";

defineOptions({ name: "DailyReportKpiGrid" });

const props = defineProps({
  isCustomerService: { type: Boolean, default: false },
  summary: { type: Object, default: () => ({}) },
});

defineEmits(["open-detail"]);

const cards = computed(() => {
  const s = props.summary || {};
  const undelivered = Number(
    s.undeliveredReservations ??
      Math.max(
        0,
        Number(s.reservations ?? 0) -
          Number(s.deliveredReservations ?? 0) -
          Number(s.cancelledReservations ?? 0),
      ),
  );

  if (props.isCustomerService) {
    return [
      {
        key: "reservations",
        label: "الحجوزات الجديدة",
        value: s.reservations ?? 0,
        hint: "حجوزاتك عبر كل الفروع",
        icon: "pi-bookmark",
        clickable: true,
        borderClass: "border-amber-500/25 bg-slate-900",
        iconWrapClass: "bg-amber-500/15 text-amber-300",
        glowClass: "bg-gradient-to-bl from-amber-500/10 to-transparent",
      },
      {
        key: "ready",
        label: "جاهزة للتسليم",
        value: s.readyReservations ?? 0,
        hint: "من حجوزاتك اليوم",
        icon: "pi-check",
        clickable: false,
        borderClass: "border-emerald-500/25 bg-slate-900",
        iconWrapClass: "bg-emerald-500/15 text-emerald-300",
        glowClass: "bg-gradient-to-bl from-emerald-500/10 to-transparent",
      },
      {
        key: "waiting",
        label: "بانتظار المخزون",
        value: s.waitingReservations ?? 0,
        hint: "من حجوزاتك اليوم",
        icon: "pi-clock",
        clickable: false,
        borderClass: "border-primary-500/25 bg-slate-900",
        iconWrapClass: "bg-primary-500/15 text-primary-300",
        glowClass: "bg-gradient-to-bl from-primary-500/10 to-transparent",
      },
      {
        key: "branches",
        label: "الفروع",
        value: s.branchesCount ?? 0,
        hint: "عدد الفروع التي حجزت عليها",
        icon: "pi-building",
        clickable: false,
        borderClass: "border-white/10 bg-slate-900",
        iconWrapClass: "bg-slate-700/50 text-slate-300",
        glowClass: "",
      },
    ];
  }

  return [
    {
      key: "sales",
      label: "المبيعات",
      value: s.sales ?? 0,
      hint: "عمليات بيع مباشر",
      icon: "pi-shopping-cart",
      clickable: true,
      borderClass: "border-primary-500/25 bg-slate-900",
      iconWrapClass: "bg-primary-500/15 text-primary-300",
      glowClass: "bg-gradient-to-bl from-primary-500/10 to-transparent",
    },
    {
      key: "undelivered",
      label: "حجوزات لم تستلم",
      value: undelivered,
      hint: "حجوزات اليوم التي لم تُسلَّم بعد",
      icon: "pi-clock",
      clickable: false,
      borderClass: "border-amber-500/25 bg-slate-900",
      iconWrapClass: "bg-amber-500/15 text-amber-300",
      glowClass: "bg-gradient-to-bl from-amber-500/10 to-transparent",
    },
    {
      key: "delivered",
      label: "الحجوزات المسلّمة",
      value: s.deliveredReservations ?? 0,
      hint: "تم التسليم اليوم",
      icon: "pi-check-circle",
      clickable: true,
      borderClass: "border-emerald-500/25 bg-slate-900",
      iconWrapClass: "bg-emerald-500/15 text-emerald-300",
      glowClass: "bg-gradient-to-bl from-emerald-500/10 to-transparent",
    },
    {
      key: "cancelled",
      label: "الحجوزات الملغاة",
      value: s.cancelledReservations ?? 0,
      hint: "إلغاءات اليوم والاسترداد",
      icon: "pi-times-circle",
      clickable: true,
      borderClass: "border-rose-500/25 bg-slate-900",
      iconWrapClass: "bg-rose-500/15 text-rose-300",
      glowClass: "bg-gradient-to-bl from-rose-500/10 to-transparent",
    },
    {
      key: "received",
      label: "المنتجات المستلمة",
      value: s.receivedQty ?? 0,
      hint: "كمية الوارد",
      icon: "pi-inbox",
      clickable: true,
      borderClass: "border-teal-500/25 bg-slate-900",
      iconWrapClass: "bg-teal-500/15 text-teal-300",
      glowClass: "bg-gradient-to-bl from-teal-500/10 to-transparent",
    },
    {
      key: "stockOut",
      label: "المنتجات المسحوبة",
      value: s.stockOutQty ?? 0,
      hint: "كمية السحب",
      icon: "pi-box",
      clickable: true,
      borderClass: "border-rose-500/25 bg-slate-900",
      iconWrapClass: "bg-rose-500/15 text-rose-300",
      glowClass: "bg-gradient-to-bl from-rose-500/10 to-transparent",
    },
    {
      key: "allMovements",
      label: "حركات المخزن",
      value: s.stockMovements ?? 0,
      hint: "كل الحركات المسجّلة",
      icon: "pi-arrows-h",
      clickable: true,
      borderClass: "border-violet-500/25 bg-slate-900",
      iconWrapClass: "bg-violet-500/15 text-violet-300",
      glowClass: "bg-gradient-to-bl from-violet-500/10 to-transparent",
    },
    {
      key: "returns",
      label: "المرتجعات",
      value: s.returns ?? 0,
      hint: "عمليات مرتجع",
      icon: "pi-replay",
      clickable: true,
      borderClass: "border-amber-500/25 bg-slate-900",
      iconWrapClass: "bg-amber-500/15 text-amber-300",
      glowClass: "bg-gradient-to-bl from-amber-500/10 to-transparent",
    },
    {
      key: "exchanges",
      label: "الاستبدالات",
      value: s.exchanges ?? 0,
      hint: "عمليات استبدال",
      icon: "pi-sync",
      clickable: true,
      borderClass: "border-primary-500/25 bg-slate-900",
      iconWrapClass: "bg-primary-500/15 text-primary-300",
      glowClass: "bg-gradient-to-bl from-primary-500/10 to-transparent",
    },
  ];
});
</script>
