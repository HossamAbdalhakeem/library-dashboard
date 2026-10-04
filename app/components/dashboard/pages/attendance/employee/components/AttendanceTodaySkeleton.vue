<template>
  <div class="space-y-4 p-5">
    <div class="flex items-start justify-between gap-3">
      <div class="grid flex-1 gap-2">
        <Skeleton width="32%" height="0.75rem" />
        <Skeleton width="52%" height="1.35rem" />
        <Skeleton width="40%" height="0.85rem" />
      </div>
      <Skeleton width="6.5rem" height="1.75rem" border-radius="999px" />
    </div>
    <Skeleton width="46%" height="2.4rem" />
    <Skeleton width="100%" height="4.75rem" border-radius="16px" />
    <Skeleton width="100%" height="4.75rem" border-radius="16px" />
    <Skeleton width="100%" height="2.75rem" border-radius="12px" />
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";

defineOptions({ name: "AttendanceTodaySkeleton" });
</script>
