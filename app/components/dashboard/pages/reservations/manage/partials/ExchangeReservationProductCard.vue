<template>
  <div class="rounded-xl border p-4 text-sm" :class="cardClass">
    <p class="mb-3 text-xs font-semibold" :class="titleClass">{{ title }}</p>

    <template v-if="hasProduct">
      <p class="text-base font-bold text-white">{{ name }}</p>
      <p class="mt-1 text-xs text-slate-400">
        مقدم من أ/ {{ teacherName || "—" }}
      </p>
      <div class="mt-3 space-y-1.5">
        <ExchangeReservationDetailRow
          v-for="row in rows"
          :key="row.key"
          :label="row.label"
          :value="row.value"
          :label-class="row.labelClass"
          :value-class="row.valueClass"
        >
          <template v-if="row.slot === 'availability'">
            <span
              class="rounded-full px-2 py-0.5 text-xs font-semibold"
              :class="row.badgeClass"
            >
              {{ row.value }}
            </span>
          </template>
        </ExchangeReservationDetailRow>
      </div>
    </template>

    <p v-else class="text-sm text-slate-400">
      {{ emptyMessage }}
    </p>
  </div>
</template>

<script setup>
defineOptions({ name: "ExchangeReservationProductCard" });

const ExchangeReservationDetailRow = defineAsyncComponent(() =>
  import("./ExchangeReservationDetailRow.vue"),
);

defineProps({
  title: { type: String, required: true },
  titleClass: { type: String, default: "text-slate-400" },
  cardClass: {
    type: String,
    default: "border-white/10 bg-slate-900 text-slate-200",
  },
  hasProduct: { type: Boolean, default: true },
  name: { type: String, default: "" },
  teacherName: { type: String, default: "" },
  rows: { type: Array, default: () => [] },
  emptyMessage: { type: String, default: "" },
});
</script>
