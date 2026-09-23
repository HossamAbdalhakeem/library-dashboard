<template>
  <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <AppSearchInput
      :model-value="search"
      label=""
      variant="dark"
      placeholder="بحث عن كتاب أو أستاذ…"
      input-class="w-full md:w-[420px]"
      :throttle-ms="350"
      @update:model-value="$emit('update:search', $event)"
      @search="(term) => $emit('search', term)"
    />
    <span class="text-sm text-slate-300 min-w-[110px]">
      إجمالي النتائج: {{ total }}
    </span>
  </div>
</template>

<script setup>
import AppSearchInput from "~/components/shared/inputs/app-search-input/index.vue";

defineOptions({ name: "BookSearchToolbar" });

defineProps({
  search: { type: String, default: "" },
  total: { type: Number, default: 0 },
});

defineEmits(["update:search", "search"]);
</script>
