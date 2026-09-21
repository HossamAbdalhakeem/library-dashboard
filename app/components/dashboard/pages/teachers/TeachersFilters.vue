<template>
  <div class="mb-5 grid gap-3 md:grid-cols-2">
    <SearchInput placeholder="ابحث باسم المدرس" @search="onSearch" />

    <div class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium text-slate-700">الحالة</label>
      <Select
        :model-value="status"
        :options="statusOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="كل الحالات"
        showClear
        class="w-full"
        @update:model-value="onStatusChange"
      />
    </div>
  </div>
</template>

<script setup>
import Select from "primevue/select";
import SearchInput from "~/components/shared/search-input/index.vue";

defineOptions({ name: "TeachersFilters" });

defineProps({
  status: { type: String, default: null },
});

const emit = defineEmits(["update:status", "search", "change"]);

const statusOptions = [
  { label: "نشط", value: "ACTIVE" },
  { label: "غير نشط", value: "INACTIVE" },
];

const onSearch = (value) => {
  emit("search", value);
};

const onStatusChange = (value) => {
  emit("update:status", value);
  emit("change");
};
</script>
