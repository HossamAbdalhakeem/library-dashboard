<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <h2
      class="text-xl font-bold"
      :class="isCustomerService ? 'text-white' : 'text-slate-900'"
    >
      {{ title }}
    </h2>
    <div class="flex flex-wrap items-center gap-2">
      <slot name="header-actions" />
      <NuxtLink
        v-if="backTo"
        :to="backTo"
        class="rounded-xl border px-4 py-2 text-sm transition"
        :class="
          isCustomerService
            ? 'border-white/10 text-slate-300 hover:bg-white/5'
            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
        "
      >
        ← رجوع للكتب
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "BookingFormHeader" });

defineProps({
  title: { type: String, default: "احجز كتاب" },
  backTo: { type: String, default: "" },
  isCustomerService: { type: Boolean, default: false },
});
</script>
