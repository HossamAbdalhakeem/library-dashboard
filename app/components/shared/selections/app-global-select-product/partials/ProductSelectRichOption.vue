<template>
  <div class="w-full min-w-0 py-1 text-right">
    <div class="flex items-start justify-between gap-2 sm:gap-3">
      <span class="min-w-0 truncate font-medium">{{ option.name }}</span>
      <span
        v-if="option.availabilityLabel"
        class="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
        :class="
          option.isAvailable
            ? 'bg-emerald-500/15 text-emerald-700'
            : option.reservationAllowed
              ? 'bg-orange-500/15 text-orange-700'
              : 'bg-amber-500/15 text-amber-700'
        "
      >
        {{ option.availabilityLabel }}
      </span>
    </div>
    <div class="mt-0.5 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
      <p v-if="option.teacherName" class="min-w-0 truncate text-xs text-slate-400">
        مقدم من أ/ {{ option.teacherName }}
      </p>
      <span
        v-if="option.priceLabel"
        class="shrink-0 text-sm"
        :class="option.isSellingPrice ? 'text-primary-600' : 'text-amber-700'"
      >
        {{ option.priceKindLabel }} {{ option.priceLabel }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  option: { type: Object, required: true },
});
</script>
