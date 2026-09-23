<template>
  <div v-if="option" class="w-full min-w-0 py-0.5 text-right">
    <div class="flex items-start justify-between gap-2 sm:gap-3">
      <span class="min-w-0 truncate font-medium text-slate-100">{{ option.name }}</span>
      <span
        v-if="option.availabilityLabel"
        class="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
        :class="
          option.isAvailable
            ? 'bg-emerald-500/20 text-emerald-300'
            : option.reservationAllowed
              ? 'bg-orange-500/20 text-orange-300'
              : 'bg-amber-500/20 text-amber-200'
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
        class="shrink-0 text-xs"
        :class="option.isSellingPrice ? 'text-primary-300' : 'text-amber-200'"
      >
        {{ option.priceKindLabel }} {{ option.priceLabel }}
      </span>
    </div>
  </div>
  <span v-else>{{ placeholder }}</span>
</template>

<script setup>
defineProps({
  option: { type: Object, default: null },
  placeholder: { type: String, default: "" },
});
</script>
