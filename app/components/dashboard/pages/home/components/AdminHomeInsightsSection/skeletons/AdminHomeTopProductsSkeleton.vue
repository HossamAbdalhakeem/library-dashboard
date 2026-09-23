<template>
  <div class="rounded-2xl border border-white/10 bg-slate-900/90 p-5">
    <div class="mb-4 space-y-2">
      <Skeleton width="10rem" height="1.1rem" border-radius="6px" />
      <Skeleton width="14rem" height="0.75rem" border-radius="6px" />
    </div>
    <div class="space-y-3">
      <div
        v-for="i in rows"
        :key="`prod-skel-${i}`"
        class="flex items-center justify-between gap-3"
      >
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <Skeleton width="2rem" height="2rem" border-radius="8px" />
          <Skeleton width="70%" height="0.9rem" border-radius="6px" />
        </div>
        <Skeleton width="2.5rem" height="0.9rem" border-radius="6px" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";

defineOptions({ name: "AdminHomeTopProductsSkeleton" });

defineProps({
  rows: { type: Number, default: 5 },
});
</script>
