<template>
  <section class="space-y-3">
    <div>
      <p class="font-bold text-white">إجراءات سريعة</p>
      <p class="mt-0.5 text-xs text-slate-400">
        اختصارات للعمليات الأكثر استخدامًا
      </p>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <AdminHomeActionCard
        v-for="action in actions"
        :key="action.key"
        :title="action.title"
        :description="action.description"
        :action-label="action.actionLabel"
        :icon="action.icon"
        :icon-wrap-class="action.iconWrapClass"
        :button-class="action.buttonClass"
        :accent-line-class="action.accentLineClass"
        @select="onSelect(action)"
      />
    </div>
  </section>
</template>

<script setup>
defineOptions({ name: "AdminHomeActionsSection" });

const AdminHomeActionCard = defineAsyncComponent(() =>
  import("./partials/AdminHomeActionCard.vue"),
);

const router = useRouter();

const actions = [
  {
    key: "reports",
    title: "التقارير",
    description: "عرض وتحميل جميع التقارير",
    actionLabel: "عرض التقارير",
    icon: "pi-chart-bar",
    to: "/reports",
    iconWrapClass: "bg-primary-500/15 text-primary-300",
    buttonClass: "bg-primary-600 hover:bg-primary-500",
    accentLineClass:
      "bg-gradient-to-l from-transparent via-primary-400/60 to-transparent",
  },
  {
    key: "reservations",
    title: "إدارة الحجوزات",
    description: "متابعة الحجوزات والإلغاء والاستلام",
    actionLabel: "إدارة الحجوزات",
    icon: "pi-bookmark",
    to: "/reservations/manage",
    iconWrapClass: "bg-amber-500/15 text-amber-300",
    buttonClass: "bg-amber-600 hover:bg-amber-500",
    accentLineClass:
      "bg-gradient-to-l from-transparent via-amber-400/60 to-transparent",
  },
  {
    key: "inventory",
    title: "إدارة المخزن",
    description: "إضافة وسحب الكميات من الفروع",
    actionLabel: "إدارة المخزن",
    icon: "pi-box",
    to: "/branches",
    iconWrapClass: "bg-emerald-500/15 text-emerald-300",
    buttonClass: "bg-emerald-600 hover:bg-emerald-500",
    accentLineClass:
      "bg-gradient-to-l from-transparent via-emerald-400/60 to-transparent",
  },
  {
    key: "teachers",
    title: "المدرسين",
    description: "إضافة وإدارة المدرسين",
    actionLabel: "إدارة المدرسين",
    icon: "pi-user",
    to: "/teachers",
    iconWrapClass: "bg-blue-500/15 text-blue-300",
    buttonClass: "bg-blue-600 hover:bg-blue-500",
    accentLineClass:
      "bg-gradient-to-l from-transparent via-blue-400/60 to-transparent",
  },
  {
    key: "exchange-refund",
    title: "المبيعات",
    description: "استبدال المنتجات واسترداد المبالغ",
    actionLabel: "المبيعات",
    icon: "pi-sync",
    to: "/sales/exchange",
    iconWrapClass: "bg-violet-500/15 text-violet-300",
    buttonClass: "bg-violet-600 hover:bg-violet-500",
    accentLineClass:
      "bg-gradient-to-l from-transparent via-violet-400/60 to-transparent",
  },
];

const onSelect = (action) => {
  if (action?.to) router.push(action.to);
};
</script>
