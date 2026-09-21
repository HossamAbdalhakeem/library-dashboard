<template>
  <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
    <div class="mb-4 flex justify-center">
      <Skeleton width="8rem" height="1.1rem" border-radius="6px" />
    </div>
    <div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <Skeleton shape="circle" size="8rem" />
      <div class="w-full max-w-xs space-y-2">
        <Skeleton
          v-for="i in rows"
          :key="`pay-skel-${i}`"
          width="100%"
          height="1rem"
          border-radius="6px"
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
