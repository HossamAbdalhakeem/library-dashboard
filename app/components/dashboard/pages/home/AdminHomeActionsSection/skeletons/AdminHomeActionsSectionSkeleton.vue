<template>
  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
    <div
      v-for="i in count"
      :key="`action-skel-${i}`"
      class="rounded-2xl border border-white/[0.06] bg-slate-950/50 p-5"
    >
      <Skeleton width="3rem" height="3rem" border-radius="16px" class="mb-4" />
      <Skeleton width="70%" height="1rem" border-radius="6px" class="mb-2" />
      <Skeleton width="100%" height="0.75rem" border-radius="6px" class="mb-1" />
      <Skeleton width="85%" height="0.75rem" border-radius="6px" class="mb-5" />
      <Skeleton width="100%" height="2.5rem" border-radius="12px" />
    </div>
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";

defineOptions({ name: "AdminHomeActionsSectionSkeleton" });

defineProps({
  count: { type: Number, default: 5 },
});
</script>
