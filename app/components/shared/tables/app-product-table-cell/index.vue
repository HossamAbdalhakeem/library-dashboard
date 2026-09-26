<template>
  <div
    v-if="hasName"
    class="flex min-w-[8rem] max-w-[18rem] flex-col items-start gap-1.5"
    dir="rtl"
  >
    <div class="flex max-w-full flex-wrap items-center gap-1.5">
      <p
        class="m-0 min-w-0 max-w-full whitespace-normal break-words text-right text-sm font-semibold leading-snug text-[var(--app-text-strong)]"
      >
        {{ product.name }}
      </p>
      <span
        v-if="hasPrice"
        class="inline-flex max-w-full items-center truncate whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 tabular-nums"
        :style="priceStyle"
      >
        {{ product.price }}
      </span>
    </div>
    <p
      v-if="hasTeacher"
      class="m-0 truncate text-xs leading-tight text-[var(--app-muted)]"
    >
      {{ product.teacherName }}
    </p>
    <p
      v-if="hasStudyYear"
      class="m-0 truncate text-xs leading-tight text-[var(--app-muted)]"
    >
      {{ product.studyYearName }}
    </p>
  </div>
</template>

<script setup>
import { DEFAULT_METRIC_COLOR } from "~/utils/domain-labels/shared";
import { STOCK_MOVEMENT_COLORS } from "~/utils/domain-labels/inventory";

defineOptions({ name: "AppProductTableCell" });

/**
 * Parent tables must normalize first and pass:
 * { name, price?, teacherName?, studyYearName?, priceColor? }
 */
const props = defineProps({
  product: { type: Object, default: null },
});

const isSet = (value) => {
  if (value == null) return false;
  const text = String(value).trim();
  return text !== "" && text !== "-" && text !== "—";
};

const hasName = computed(() => isSet(props.product?.name));
const hasPrice = computed(() => isSet(props.product?.price));
const hasTeacher = computed(() => isSet(props.product?.teacherName));
const hasStudyYear = computed(() => isSet(props.product?.studyYearName));

const priceStyle = computed(() => {
  const c =
    props.product?.priceColor ||
    STOCK_MOVEMENT_COLORS.SALE ||
    DEFAULT_METRIC_COLOR;
  return {
    color: c,
    backgroundColor: `${c}22`,
    border: `1px solid ${c}55`,
  };
});
</script>
