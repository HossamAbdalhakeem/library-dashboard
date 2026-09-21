<template>
  <Tag
    :value="resolvedLabel"
    :severity="resolvedSeverity"
    :rounded="rounded"
    :icon="icon"
    v-bind="$attrs"
  />
</template>

<script setup>
import Tag from "primevue/tag";
import { getStatusTagMeta } from "~/utils/statusTags";

defineOptions({
  name: "AppStatusTag",
  inheritAttrs: false,
});

const props = defineProps({
  /** Catalog kind: reservation | entity | stock-movement | transaction | sale | product-availability | product-type */
  kind: { type: String, default: "" },
  /** Raw status/type code (e.g. DELIVERED, STOCK_IN) */
  code: { type: [String, Number], default: "" },
  /** Optional display label override */
  label: { type: String, default: "" },
  /** Optional severity override (success | info | warn | danger | secondary | contrast) */
  severity: { type: String, default: "" },
  rounded: { type: Boolean, default: false },
  icon: { type: String, default: "" },
});

const meta = computed(() =>
  getStatusTagMeta(props.kind, props.code, {
    label: props.label || undefined,
    severity: props.severity || undefined,
  }),
);

const resolvedLabel = computed(
  () => props.label || meta.value.label || String(props.code || "—"),
);

const resolvedSeverity = computed(
  () => props.severity || meta.value.severity || "secondary",
);
</script>
