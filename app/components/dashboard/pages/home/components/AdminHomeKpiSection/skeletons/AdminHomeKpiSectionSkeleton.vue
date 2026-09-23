<template>
  <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <div
      v-for="i in count"
      :key="`kpi-skel-${i}`"
      class="rounded-2xl border border-white/10 bg-slate-900 p-4"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="w-full space-y-3">
          <Skeleton width="5rem" height="0.85rem" border-radius="6px" />
          <Skeleton width="4rem" height="1.75rem" border-radius="8px" />
          <Skeleton width="7rem" height="0.7rem" border-radius="6px" />
        </div>
        <Skeleton width="2.5rem" height="2.5rem" border-radius="12px" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";

defineOptions({ name: "AdminHomeKpiSectionSkeleton" });

defineProps({
  count: { type: Number, default: 4 },
});
</script>
