<template>
  <div :class="[gridClass, wrapperClass]">
    <div
      v-for="(item, index) in visibleItems"
      :key="item.key || `${item.label}-${index}`"
      class="flex min-w-0 items-start justify-between gap-2"
      :class="item.rowClass"
    >
      <span class="shrink-0" :class="item.labelClass || labelClass">{{ item.label }}</span>
      <span
        class="min-w-0 break-words"
        :dir="item.valueDir || undefined"
        :class="[
          item.valueClass || valueClass,
          item.valueDir === 'ltr' ? 'text-right' : 'text-end',
        ]"
      >
        <slot
          v-if="item.slot"
          :name="item.slot"
          :item="item"
        >
          {{ item.value }}
        </slot>
        <template v-else>{{ item.value }}</template>
      </span>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "AppDetailRows" });

const props = defineProps({
  /**
   * @type {{
   *   key?: string,
   *   label: string,
   *   value?: string|number,
   *   labelClass?: string,
   *   valueClass?: string,
   *   valueDir?: "ltr" | "rtl",
   *   rowClass?: string,
   *   slot?: string,
   *   hidden?: boolean,
   * }[]}
   */
  items: { type: Array, default: () => [] },
  /** 1 or 2 column grid */
  columns: { type: [Number, String], default: 1 },
  labelClass: { type: String, default: "text-slate-500" },
  valueClass: { type: String, default: "font-medium" },
  wrapperClass: { type: String, default: "" },
});

const visibleItems = computed(() =>
  (Array.isArray(props.items) ? props.items : []).filter(
    (item) => item && !item.hidden,
  ),
);

const gridClass = computed(() => {
  const cols = Number(props.columns) || 1;
  return cols >= 2 ? "grid gap-2 sm:grid-cols-2" : "grid gap-2";
});
</script>
