<template>
  <div class="space-y-4">
    <div class="flex items-end justify-between gap-2">
      <Skeleton width="2.5rem" height="0.7rem" border-radius="4px" />
      <Skeleton width="2.5rem" height="0.7rem" border-radius="4px" />
    </div>
    <Skeleton width="100%" height="12rem" border-radius="12px" />
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";

defineOptions({ name: "AdminHomeSalesTrendSkeleton" });
</script>
