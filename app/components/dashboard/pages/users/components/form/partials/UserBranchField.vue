<template>
  <Field
    v-slot="{ errorMessage }"
    :model-value="branchId"
    name="branchId"
    rules="required"
    @update:model-value="$emit('update:branchId', $event)"
  >
    <div class="flex flex-col gap-2 text-right">
      <AppGlobalSelectBranch
        :model-value="branchId"
        label="الفرع"
        placeholder="اختر الفرع"
        :invalid="!!(errorMessage || fieldErrors?.branchId)"
        @update:model-value="$emit('update:branchId', $event)"
      />
      <ErrorMessage name="branchId" class="text-xs text-red-500" />
    </div>
  </Field>
</template>

<script setup>
import AppGlobalSelectBranch from "~/components/shared/selections/app-global-select-branch/index.vue";
import { Field, ErrorMessage } from "vee-validate";

defineOptions({ name: "UserBranchField" });

defineProps({
  branchId: { type: [String, Number, null], default: null },
  fieldErrors: { type: Object, default: () => ({}) },
});

defineEmits(["update:branchId"]);
</script>
