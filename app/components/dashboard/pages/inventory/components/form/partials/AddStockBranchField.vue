<template>
  <div v-if="!lockedBranchId" class="flex flex-col gap-2 text-right">
    <AppGlobalSelectBranch
      :model-value="branchId"
      label="الفرع"
      placeholder="اختار الفرع ▾"
      :invalid="!!error"
      @update:model-value="$emit('update:branchId', $event)"
    />
    <small v-if="error" class="text-xs text-red-500">{{ error }}</small>
  </div>

  <div
    v-else
    class="rounded-xl bg-slate-50 px-3 py-2 text-right text-sm text-slate-600"
  >
    الفرع: <strong class="text-slate-900">{{ branchName || "—" }}</strong>
  </div>
</template>

<script setup>
import AppGlobalSelectBranch from "~/components/shared/selections/app-global-select-branch/index.vue";

defineOptions({ name: "AddStockBranchField" });

defineProps({
  branchId: { type: [String, Number, null], default: null },
  lockedBranchId: { type: String, default: "" },
  branchName: { type: String, default: "" },
  error: { type: String, default: "" },
});

defineEmits(["update:branchId"]);
</script>
