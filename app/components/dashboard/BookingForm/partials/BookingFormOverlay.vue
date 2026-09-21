<template>
  <div
    class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-xl bg-slate-950/55 backdrop-blur-[1px]"
  >
    <i
      class="pi pi-spin pi-spinner text-3xl"
      :class="isCustomerService ? 'text-primary-300' : 'text-primary-600'"
    />
    <p
      class="text-sm font-medium"
      :class="isCustomerService ? 'text-slate-200' : 'text-slate-700'"
    >
      جاري تحميل بيانات المنتج…
    </p>
  </div>
</template>

<script setup>
defineOptions({ name: "BookingFormOverlay" });

defineProps({
  isCustomerService: { type: Boolean, default: false },
});
</script>
