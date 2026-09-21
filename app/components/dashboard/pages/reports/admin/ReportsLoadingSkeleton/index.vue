<template>
  <div class="space-y-6">
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="i in 4"
        :key="`kpi-${i}`"
        class="rounded-xl border border-white/10 bg-slate-900 p-4"
      >
        <Skeleton width="7rem" height="0.9rem" class="mb-3" />
        <Skeleton width="60%" height="1.8rem" />
      </div>
    </div>
    <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
      <Skeleton width="5rem" height="1rem" class="mb-3" />
      <Skeleton width="80%" height="0.9rem" class="mb-2" />
      <Skeleton width="70%" height="0.9rem" class="mb-2" />
      <Skeleton width="65%" height="0.9rem" />
    </div>
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";

defineOptions({ name: "ReportsLoadingSkeleton" });
</script>
