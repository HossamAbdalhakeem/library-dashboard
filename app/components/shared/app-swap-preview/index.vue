<template>
  <div class="grid gap-3 sm:grid-cols-2">
    <SwapPreviewCard
      :label="fromLabel"
      :label-class="fromLabelClass"
      :title="fromTitle"
      :subtitle="fromSubtitle"
    />
    <SwapPreviewCard
      :label="toLabel"
      :label-class="toLabelClass"
      :title="toTitle"
      :subtitle="toSubtitle"
    />
  </div>
</template>

<script setup>
import SwapPreviewCard from "./partials/SwapPreviewCard.vue";

defineOptions({ name: "AppSwapPreview" });

defineProps({
  fromLabel: { type: String, default: "من" },
  toLabel: { type: String, default: "إلى" },
  fromLabelClass: { type: String, default: "text-rose-300" },
  toLabelClass: { type: String, default: "text-emerald-300" },
  fromTitle: { type: String, default: "" },
  fromSubtitle: { type: String, default: "" },
  toTitle: { type: String, default: "" },
  toSubtitle: { type: String, default: "" },
});
</script>
