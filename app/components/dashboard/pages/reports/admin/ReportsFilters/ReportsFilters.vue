<template>
  <div
    class="reports-filters flex w-full min-w-0 flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:justify-end"
  >
    <AppGlobalSelectProduct
      :model-value="book"
      source="catalog"
      variant="simple"
      name-only
      label=""
      placeholder="اختيار الكتاب"
      show-clear
      wrapper-class="w-full min-w-0 lg:w-72 lg:shrink-0"
      @update:model-value="onBookChange"
    />
    <AppGlobalSelectBranch
      :model-value="branch"
      label=""
      placeholder="كل الفروع"
      include-all-option
      all-option-label="كل الفروع"
      all-option-value="all"
      wrapper-class="w-full min-w-0 lg:w-72 lg:shrink-0"
      select-class="w-full"
      @update:model-value="onBranchChange"
    />

    <AppPeriodDateFilter
      :from="from"
      :to="to"
      :academic-year-range="academicYearRange"
      default-period="day"
      wrapper-class="w-full min-w-0 lg:w-72 lg:shrink-0"
      select-class="w-full"
      @update:from="emit('update:from', $event)"
      @update:to="emit('update:to', $event)"
      @update:period="emit('update:period', $event)"
      @change="emit('change', $event)"
    />

    <Button
      icon="pi pi-refresh"
      severity="secondary"
      class="h-11 w-11 shrink-0 self-end"
      :loading="loading"
      @click="$emit('refresh')"
    />
  </div>
</template>

<script setup>
import Button from "primevue/button";
import AppGlobalSelectProduct from "~/components/shared/selections/app-global-select-product/index.vue";
import AppGlobalSelectBranch from "~/components/shared/selections/app-global-select-branch/index.vue";
import AppPeriodDateFilter from "~/components/shared/reports/app-period-date-filter/index.vue";

defineOptions({ name: "ReportsFilters" });

defineProps({
  book: { type: [String, Number], default: null },
  branch: { type: [String, Number], default: "all" },
  from: { type: String, default: null },
  to: { type: String, default: null },
  period: { type: String, default: "day" },
  academicYearRange: { type: Object, default: null },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits([
  "update:book",
  "update:branch",
  "update:from",
  "update:to",
  "update:period",
  "change",
  "refresh",
]);

const onBookChange = (value) => {
  emit("update:book", value ?? null);
  emit("change");
};

const onBranchChange = (value) => {
  emit("update:branch", value);
  emit("change");
};
</script>
