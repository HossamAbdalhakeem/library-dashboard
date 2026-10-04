<template>
  <div v-if="reservation" class="flex flex-col items-center text-center">
    <div
      class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl font-bold text-white"
    >
      ✓
    </div>
    <p class="text-base font-bold text-slate-900">تم تسليم الحجز بنجاح</p>
    <p class="mt-1 text-sm text-slate-500">تم خصم الكمية من المخزون</p>

    <div
      class="mt-5 w-full space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-right"
    >
      <div
        v-for="(row, index) in rows"
        :key="row.key"
        class="flex items-center justify-between gap-3"
        :class="index > 0 ? 'border-t border-slate-200 pt-3' : ''"
      >
        <span class="text-xs text-slate-500">{{ row.label }}</span>
        <span class="text-sm font-medium text-slate-800">{{ row.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "DeliverReservationSuccessContent" });

const props = defineProps({
  reservation: { type: Object, default: null },
});

const rows = computed(() => {
  const r = props.reservation;
  if (!r) return [];
  return [
    { key: "number", label: "رقم الحجز", value: r.reservationNumber },
    { key: "student", label: "الطالب", value: r.student?.name },
    { key: "product", label: "المنتج", value: r.product?.name },
    { key: "quantity", label: "الكمية", value: r.quantity ?? 1 },
  ];
});
</script>
