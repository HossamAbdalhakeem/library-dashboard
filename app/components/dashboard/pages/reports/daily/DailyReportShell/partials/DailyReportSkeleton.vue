<template>
  <div class="grid gap-4 xl:grid-cols-3 xl:items-start">
    <div class="flex flex-col gap-4 xl:col-span-1">
      <div class="rounded-2xl border border-white/10 bg-slate-900 p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="w-full space-y-3">
            <Skeleton width="8rem" height="0.9rem" border-radius="6px" />
            <Skeleton width="70%" height="2.25rem" border-radius="8px" />
          </div>
          <Skeleton width="2.75rem" height="2.75rem" border-radius="12px" />
        </div>
        <div class="mt-5 grid grid-cols-2 gap-3">
          <Skeleton width="100%" height="3.5rem" border-radius="12px" />
          <Skeleton width="100%" height="3.5rem" border-radius="12px" />
        </div>
      </div>

      <div class="rounded-2xl border border-white/10 bg-slate-900 p-5">
        <div class="mb-4 space-y-2">
          <Skeleton width="8rem" height="1.1rem" border-radius="6px" />
          <Skeleton width="14rem" height="0.75rem" border-radius="6px" />
        </div>
        <div class="flex flex-col items-center gap-4">
          <Skeleton shape="circle" size="8rem" />
          <div class="w-full space-y-2">
            <Skeleton
              v-for="i in 3"
              :key="`pay-skel-${i}`"
              width="100%"
              height="1rem"
              border-radius="6px"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      class="rounded-2xl border border-white/10 bg-slate-900 p-5 xl:col-span-2"
    >
      <div class="mb-4 space-y-2">
        <Skeleton width="10rem" height="1.1rem" border-radius="6px" />
        <Skeleton width="16rem" height="0.75rem" border-radius="6px" />
      </div>
      <div class="flex flex-col gap-5">
        <div
          class="mx-auto flex h-52 w-full max-w-[240px] items-center justify-center"
        >
          <Skeleton shape="circle" size="11rem" />
        </div>
        <div class="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          <Skeleton
            v-for="i in 9"
            :key="`legend-skel-${i}`"
            width="100%"
            height="2.75rem"
            border-radius="12px"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";

defineOptions({ name: "DailyReportSkeleton" });
</script>
