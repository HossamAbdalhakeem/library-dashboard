<template>
  <div class="overflow-hidden rounded-xl border border-white/5">
    <AppDataTable
      :value="rows"
      :columns="columns"
      empty-message="لا توجد بيانات مخزون."
    >
      <template #type="{ data }">
        <span class="inline-flex items-center justify-center gap-2">
          <span
            class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            :class="data.iconWrapClass"
          >
            <i :class="['pi text-xs', data.icon]" />
          </span>
          <span class="font-medium text-slate-100">{{ data.type }}</span>
        </span>
      </template>
      <template #available="{ data }">
        <span
          class="inline-flex min-w-[2.5rem] items-center justify-center rounded-lg px-2 py-1 text-sm font-bold"
          :class="data.availableClass"
        >
          {{ data.available }}
        </span>
      </template>
    </AppDataTable>
  </div>
</template>

<script setup>
defineOptions({ name: "InventoryTable" });

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/tables/app-data-table/index.vue"),
);

defineProps({
  rows: { type: Array, default: () => [] },
});

const columns = [
  { field: "type", header: "النوع", slot: "type" },
  { field: "total", header: "كل" },
  { field: "reserved", header: "محجوز" },
  { field: "available", header: "متاح", slot: "available" },
];
</script>
