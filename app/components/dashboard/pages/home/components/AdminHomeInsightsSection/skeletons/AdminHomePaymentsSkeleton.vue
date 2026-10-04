<template>
  <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
    <div class="mb-4 flex justify-center">
      <Skeleton width="8rem" height="1.1rem" border-radius="6px" />
    </div>
    <div class="flex flex-col items-center gap-4">
      <div class="flex flex-wrap items-center justify-center gap-4">
        <Skeleton shape="circle" size="7rem" />
        <div class="grid gap-2">
          <Skeleton
            v-for="i in rows"
            :key="`pay-legend-${i}`"
            width="7.5rem"
            height="0.85rem"
            border-radius="6px"
          />
        </div>
      </div>
      <div class="w-full space-y-2">
        <Skeleton
          v-for="i in rows"
          :key="`pay-skel-${i}`"
          width="100%"
          height="4.25rem"
          border-radius="8px"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";

defineOptions({ name: "AdminHomePaymentsSkeleton" });

defineProps({
  rows: { type: Number, default: 3 },
});
</script>
