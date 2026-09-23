<template>
  <Field
    v-slot="{}"
    :model-value="branchId"
    name="branchId"
    @update:model-value="$emit('update:branchId', $event)"
  >
    <AppGlobalSelectBranch
      :model-value="branchId"
      label="الفرع (اختياري)"
      placeholder="كل الفروع / عام"
      show-clear
      @update:model-value="$emit('update:branchId', $event)"
    />
  </Field>
</template>

<script setup>
import AppGlobalSelectBranch from "~/components/shared/selections/app-global-select-branch/index.vue";
import { Field } from "vee-validate";

defineOptions({ name: "ExpenseBranchField" });

defineProps({
  branchId: { type: [String, Number, null], default: null },
});

defineEmits(["update:branchId"]);
</script>
