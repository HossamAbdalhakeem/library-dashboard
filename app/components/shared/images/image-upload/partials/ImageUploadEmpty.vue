<template>
  <button
    type="button"
    class="flex w-full flex-col items-center gap-2 px-4 py-6 text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
    @click="$emit('pick')"
  >
    <span
      class="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900/5 text-slate-600 dark:bg-white/5 dark:text-slate-200"
    >
      <i class="pi pi-cloud-upload text-xl" />
    </span>
    <span class="text-sm font-medium">{{ placeholder }}</span>
    <span class="text-xs text-slate-400">
      صور فقط — الحد الأقصى {{ maxSizeLabel }}
    </span>
  </button>
</template>

<script setup>
defineOptions({ name: "ImageUploadEmpty" });

defineProps({
  placeholder: { type: String, required: true },
  maxSizeLabel: { type: String, required: true },
});

defineEmits(["pick"]);
</script>
