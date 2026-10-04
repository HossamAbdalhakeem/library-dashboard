<template>
  <Dialog
    :visible="visible"
    modal
    dir="rtl"
    :header="header"
    :closable="!saving"
    :dismissable-mask="!saving"
    :close-on-escape="!saving"
    :style="{ width: '440px', maxWidth: '95vw' }"
    :pt="{
      header: { class: 'text-right' },
      content: { class: 'text-right' },
    }"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="space-y-3 text-right text-sm text-slate-700">
      <p>
        {{ lead }}
        <span class="font-bold text-slate-900">{{ summary?.productName }}</span>
        ؟
      </p>

      <div class="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <PaymentSummaryRow label="المنتج" :bordered="false">
          <div class="text-sm font-semibold text-slate-900">
            <p>{{ summary?.productName || "—" }}</p>
            <p
              v-if="summary?.teacherName"
              class="mt-0.5 text-xs font-normal text-slate-500"
            >
              مقدم من أ/ {{ summary.teacherName }}
            </p>
          </div>
        </PaymentSummaryRow>

        <PaymentSummaryRow
          label="الطالب"
          :value="summary?.studentName || '—'"
        />

        <slot name="extra" />

        <PaymentSummaryRow
          :label="amountLabel"
          :value="formatMoney(summary?.productAmount)"
          value-class="text-sm font-semibold text-slate-900"
        />
        <PaymentSummaryRow
          v-if="feeAmount != null"
          label="رسوم التحويل"
          :value="formatMoney(feeAmount)"
          label-class="text-sm font-semibold text-slate-700"
          value-class="text-sm font-semibold text-slate-900"
        />
        <PaymentSummaryRow
          label="الإجمالي"
          :value="formatMoney(payableTotal)"
          label-class="text-sm font-semibold text-emerald-700"
          value-class="text-lg font-extrabold text-emerald-700"
          border-class="border-emerald-200"
        />
      </div>

      <p v-if="feeAmount != null" class="text-xs text-slate-500">
        الإجمالي هو {{ amountLabel }} بالإضافة إلى رسوم التحويل. لا تُسترد رسوم التحويل.
      </p>
    </div>

    <template #footer>
      <div class="flex w-full justify-start gap-2">
        <Button
          :label="confirmLabel"
          :loading="saving"
          :disabled="saving"
          @click="emit('confirm')"
        />
        <Button
          label="رجوع"
          text
          severity="secondary"
          :disabled="saving"
          @click="emit('update:visible', false)"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import PaymentSummaryRow from "~/components/shared/dialog/payment-summary-row/index.vue";
import { formatMoney } from "~/utils/format/money";
import { transferTotal, visibleFeeAmount } from "~/utils/payment-fee";

defineOptions({ name: "PaymentConfirmDialog" });

const props = defineProps({
  visible: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  header: { type: String, required: true },
  confirmLabel: { type: String, required: true },
  lead: { type: String, required: true },
  summary: { type: Object, default: null },
  amountLabel: { type: String, default: "سعر المنتج" },
});

const emit = defineEmits(["update:visible", "confirm"]);

const feeAmount = computed(() => visibleFeeAmount(props.summary?.feeAmount));
const payableTotal = computed(() =>
  transferTotal(props.summary?.productAmount, feeAmount.value),
);
</script>
