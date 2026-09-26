<template>
  <div
    class="relative mx-auto aspect-[3/4] w-full max-h-[68vh] bg-black sm:aspect-video sm:max-h-[420px]"
  >
    <slot />

    <div
      class="pointer-events-none absolute inset-4 rounded-2xl border border-white/25 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
    >
      <span
        class="absolute start-0 top-0 h-5 w-5 rounded-ss-xl border-s-2 border-t-2 border-primary-300"
      />
      <span
        class="absolute end-0 top-0 h-5 w-5 rounded-se-xl border-e-2 border-t-2 border-primary-300"
      />
      <span
        class="absolute bottom-0 start-0 h-5 w-5 rounded-es-xl border-b-2 border-s-2 border-primary-300"
      />
      <span
        class="absolute bottom-0 end-0 h-5 w-5 rounded-ee-xl border-b-2 border-e-2 border-primary-300"
      />
    </div>

    <div
      v-if="streamReady && !error"
      class="pointer-events-none absolute inset-x-0 top-3 flex justify-center"
    >
      <span
        class="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-emerald-300 backdrop-blur-sm"
      >
        <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
        الكاميرا جاهزة
      </span>
    </div>

    <div
      v-if="starting"
      class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-950/85"
    >
      <i class="pi pi-spin pi-spinner text-2xl text-primary-300" />
      <span class="text-sm text-slate-200">جاري فتح الكاميرا…</span>
    </div>

    <div
      v-else-if="error"
      class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950/90 px-6 text-center"
    >
      <span
        class="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300"
      >
        <i class="pi pi-exclamation-circle text-xl" />
      </span>
      <p class="text-sm leading-relaxed text-rose-200">{{ error }}</p>
    </div>

    <slot name="canvas" />
  </div>
</template>

<script setup>
defineOptions({ name: "CameraCapturePreview" });

defineProps({
  starting: { type: Boolean, default: false },
  streamReady: { type: Boolean, default: false },
  error: { type: String, default: "" },
});
</script>
