<template>
  <div class="rounded-2xl border border-white/10 bg-slate-900/90 p-4">
    <div class="mb-4 grid grid-cols-7 gap-2">
      <Skeleton
        v-for="i in 7"
        :key="`ops-head-${i}`"
        width="100%"
        height="0.85rem"
        border-radius="6px"
      />
    </div>
    <div class="space-y-3">
      <div
        v-for="row in rows"
        :key="`ops-row-${row}`"
        class="grid grid-cols-7 gap-2"
      >
        <Skeleton
          v-for="col in 7"
          :key="`ops-cell-${row}-${col}`"
          width="100%"
          height="1.1rem"
          border-radius="6px"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";

defineOptions({ name: "AdminHomeRecentOperationsSkeleton" });

defineProps({
  rows: { type: Number, default: 5 },
});
</script>
