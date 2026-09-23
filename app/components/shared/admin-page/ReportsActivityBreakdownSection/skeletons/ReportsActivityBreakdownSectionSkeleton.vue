<template>
  <div class="space-y-4">
    <div class="flex flex-wrap gap-1">
      <Skeleton
        v-for="i in 3"
        :key="`tab-skel-${i}`"
        width="7rem"
        height="2.25rem"
        border-radius="12px"
      />
    </div>
    <div class="space-y-2">
      <Skeleton
        v-for="i in rows"
        :key="`row-skel-${i}`"
        width="100%"
        height="2.75rem"
        border-radius="10px"
      />
    </div>
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";

defineOptions({ name: "ReportsActivityBreakdownSectionSkeleton" });

defineProps({
  rows: { type: Number, default: 4 },
});
</script>
