<template>
  <div
    v-if="!parts.empty"
    class="inline-flex min-w-[7.5rem] flex-col items-center gap-0.5 text-center leading-tight"
    dir="rtl"
  >
    <span
      v-if="parts.date"
      class="whitespace-nowrap text-[0.8125rem] font-medium text-neutral-100"
    >
      {{ parts.date }}
    </span>
    <span
      v-if="parts.time"
      class="whitespace-nowrap text-xs font-medium tabular-nums text-neutral-400"
    >
      {{ parts.time }}
    </span>
  </div>
  <span v-else class="text-neutral-400">{{ parts.emptyLabel }}</span>
</template>

<script setup>
import { formatDateTimeParts } from "~/utils/format/datetime";

defineOptions({ name: "AppDatetimeTableCell" });

const props = defineProps({
  /** Raw date / ISO string / timestamp */
  value: { type: [String, Number, Date], default: null },
  /**
   * Format preset or custom options.
   * Presets: `stacked` (default), `date`, `time`
   * Custom: `{ locale, date, time, empty }`
   */
  format: { type: [String, Object], default: "stacked" },
});

const parts = computed(() => formatDateTimeParts(props.value, props.format));
</script>
