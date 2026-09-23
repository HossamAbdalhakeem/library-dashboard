<template>
  <Field
    v-slot="{ errorMessage }"
    v-model="amount"
    name="amount"
    label="المبلغ المدفوع مقدما"
    rules="required|min_value:1"
  >
    <div class="md:col-span-2 flex flex-col gap-2 text-right">
      <div class="flex items-center justify-between gap-2">
        <label class="text-sm font-medium text-slate-700"
          >المبلغ المدفوع (مقدم)</label
        >
        <span
          v-if="productDepositCap > 0"
          class="text-xs font-medium text-slate-500"
        >
          الحد الأقصى: {{ formatMoney(productDepositCap) }}
        </span>
      </div>
      <AppInputNumber
        v-model="amount"
        data-testid="booking-deposit-amount"
        mode="currency"
        currency="EGP"
        :min="1"
        :max="productDepositCap > 0 ? productDepositCap : undefined"
        :min-fraction-digits="2"
        :use-grouping="true"
        :invalid="!!(errorMessage || fieldErrors.amount || amountError)"
      />
      <p v-if="amountError" class="text-xs text-red-500">
        {{ amountError }}
      </p>
      <ErrorMessage name="amount" class="text-xs text-red-500" />
    </div>
  </Field>
</template>

<script setup>
import AppInputNumber from "~/components/shared/inputs/app-input-number/index.vue";
import { Field, ErrorMessage } from "vee-validate";
import { formatMoney } from "~/utils/format/money";

defineOptions({ name: "BookingFormAmountField" });

const amount = defineModel({ default: null });

defineProps({
  fieldErrors: { type: Object, default: () => ({}) },
  productDepositCap: { type: Number, default: 0 },
  amountError: { type: String, default: "" },
});
</script>
