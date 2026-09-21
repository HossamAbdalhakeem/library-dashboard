<template>
  <div class="space-y-3 text-sm text-slate-700">
    <slot name="message">
      <p v-if="message">{{ message }}</p>
    </slot>

    <p
      v-if="warning"
      class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700"
    >
      {{ warning }}
    </p>

    <slot />

    <AppDetailRows
      v-if="details.length"
      :items="details"
      :label-class="detailLabelClass"
      :value-class="detailValueClass"
    />

    <p
      v-if="notice"
      class="rounded-lg border px-3 py-2"
      :class="noticeClass"
    >
      {{ notice }}
    </p>
  </div>
</template>

<script setup>
import AppDetailRows from "~/components/shared/app-detail-rows/index.vue";

defineOptions({ name: "AppConfirmContent" });

defineProps({
  /** Plain confirmation question when not using #message slot */
  message: { type: String, default: "" },
  /** Irreversible / danger callout */
  warning: { type: String, default: "" },
  /** Secondary notice (e.g. price difference text) */
  notice: { type: String, default: "" },
  noticeClass: {
    type: [String, Array, Object],
    default: "border-slate-200 bg-slate-50 text-slate-700",
  },
  /** Optional label/value rows under the body */
  details: { type: Array, default: () => [] },
  detailLabelClass: { type: String, default: "text-slate-600" },
  detailValueClass: { type: String, default: "font-semibold text-slate-900" },
});
</script>
