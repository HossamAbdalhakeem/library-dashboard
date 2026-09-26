<template>
  <div class="flex items-center justify-center gap-6 px-4 py-5">
    <button
      type="button"
      class="inline-flex h-11 min-w-[5.5rem] items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:opacity-40"
      :disabled="starting"
      @click="$emit('close')"
    >
      إلغاء
    </button>

    <button
      type="button"
      class="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_0_0_6px_rgba(255,255,255,0.12)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
      :disabled="starting || !streamReady || Boolean(error)"
      data-testid="camera-capture-shot"
      aria-label="التقاط"
      @click="$emit('capture')"
    >
      <span class="h-12 w-12 rounded-full border-[3px] border-slate-900 bg-white" />
    </button>

    <div class="min-w-[5.5rem] text-center text-[11px] text-slate-500">
      {{ streamReady ? "اضغط للالتقاط" : "انتظر…" }}
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "CameraCaptureActions" });

defineProps({
  starting: { type: Boolean, default: false },
  streamReady: { type: Boolean, default: false },
  error: { type: String, default: "" },
});

defineEmits(["close", "capture"]);
</script>
