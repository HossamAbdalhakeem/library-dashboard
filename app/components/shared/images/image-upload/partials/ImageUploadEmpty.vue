<template>
  <button
    type="button"
    class="flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-white/80 px-3 py-3 text-sm font-semibold text-slate-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/60 dark:bg-slate-950/70 dark:text-slate-100"
    @click="$emit('pick')"
  >
    <PaymentIcon name="image" class="size-5 text-slate-400" />
    <span>{{ placeholder }}</span>
    <span class="text-[11px] font-normal text-slate-400">
      · {{ maxSizeLabel }}
    </span>
  </button>
</template>

<script setup>
import PaymentIcon from "~/components/shared/payment/payment-icon/index.vue";

defineOptions({ name: "ImageUploadEmpty" });

defineProps({
  placeholder: { type: String, required: true },
  maxSizeLabel: { type: String, required: true },
});

defineEmits(["pick"]);
</script>
