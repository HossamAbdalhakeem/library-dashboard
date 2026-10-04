<template>
  <div class="space-y-3 text-right text-sm text-slate-700">
    <p>
      هل أنت متأكد من تسليم الحجز
      <span class="font-bold text-slate-900">
        {{ reservation?.reservationNumber }}
      </span>
      ؟
    </p>
    <p class="text-sm text-emerald-700">
      لا يوجد مبلغ متبقي. سيتم التسليم مباشرة.
    </p>
  </div>
</template>

<script setup>
defineProps({
  reservation: { type: Object, default: null },
});
</script>
