<template>
  <Field
    v-slot="{ errorMessage }"
    :model-value="amount"
    name="amount"
    label="المبلغ"
    rules="required|min_value:0.01"
    @update:model-value="$emit('update:amount', $event)"
  >
    <div class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium text-slate-700">المبلغ</label>
      <AppInputNumber
        :model-value="amount"
        mode="currency"
        currency="EGP"
        :min="0"
        :min-fraction-digits="2"
        :invalid="!!(errorMessage || fieldErrors?.amount)"
        @update:model-value="$emit('update:amount', $event)"
      />
      <ErrorMessage name="amount" class="text-xs text-red-500" />
    </div>
  </Field>
</template>

<script setup>
import AppInputNumber from "~/components/shared/inputs/app-input-number/index.vue";
import { Field, ErrorMessage } from "vee-validate";

defineOptions({ name: "ExpenseAmountField" });

defineProps({
  amount: { type: [Number, null], default: null },
  fieldErrors: { type: Object, default: () => ({}) },
});

defineEmits(["update:amount"]);
</script>
