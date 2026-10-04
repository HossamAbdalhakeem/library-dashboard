<template>
  <Dialog
    :visible="visible"
    modal
    dir="rtl"
    :closable="false"
    :dismissable-mask="false"
    :close-on-escape="false"
    :style="{ width: '440px', maxWidth: '95vw' }"
    :pt="{
      header: { class: 'hidden' },
      content: { class: 'pt-6' },
    }"
    @update:visible="emit('update:visible', $event)"
  >
    <div v-if="summary" class="flex flex-col items-center text-center">
      <div
        class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl font-bold text-white"
      >
        ✓
      </div>
      <p class="text-base font-bold text-slate-900">{{ title }}</p>

      <div
        class="mt-5 w-full space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-right"
      >
        <PaymentSummaryRow
          :label="referenceLabel"
          :value="referenceValue"
          :bordered="false"
          :value-class="referenceValueClass"
        />
        <PaymentSummaryRow label="التاريخ والوقت" :value="summary.dateTimeLabel" />
        <PaymentSummaryRow label="المنتج">
          <div class="text-sm font-semibold text-slate-900">
            <p>{{ summary.productName }}</p>
            <p
              v-if="summary.teacherName"
              class="mt-0.5 text-xs font-normal text-slate-500"
            >
              مقدم من أ/ {{ summary.teacherName }}
            </p>
          </div>
        </PaymentSummaryRow>
        <PaymentSummaryRow
          v-if="showStudyYear"
          label="السنة الدراسية"
          :value="summary.studyYearName || '-'"
        />
        <PaymentSummaryRow label="الطالب" :value="summary.studentName" />

        <slot name="extra" />

        <PaymentSummaryRow
          v-if="methodPosition === 'before-price'"
          label="طريقة الدفع"
        >
          <PaymentProofThumb
            :method="summary.method"
            :method-label="summary.methodLabel"
            :payment-id="summary.paymentId"
            :has-proof="summary.hasProof"
            :proof-url="summary.paymentId ? '' : summary.proofImage"
          />
        </PaymentSummaryRow>

        <PaymentSummaryRow
          :label="amountLabel"
          :value="formatMoney(productAmount)"
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
          v-if="methodPosition === 'after-fee'"
          label="طريقة الدفع"
        >
          <PaymentProofThumb
            :method="summary.method"
            :method-label="summary.methodLabel"
            :payment-id="summary.paymentId"
            :has-proof="summary.hasProof"
            :proof-url="summary.paymentId ? '' : summary.proofImage"
          />
        </PaymentSummaryRow>
        <PaymentSummaryRow
          label="الإجمالي"
          :value="formatMoney(payableTotal)"
          label-class="text-sm font-semibold text-emerald-700"
          value-class="text-lg font-extrabold text-emerald-700"
          border-class="border-emerald-200"
        />
      </div>

      <p v-if="$slots.footnote" class="mt-3 text-xs text-slate-500">
        <slot name="footnote" />
      </p>
    </div>

    <template #footer>
      <slot name="footer">
        <div class="flex w-full justify-center">
          <Button
            label="إغلاق"
            severity="secondary"
            class="min-w-[120px]"
            @click="onClose"
          />
        </div>
      </slot>
    </template>
  </Dialog>
</template>

<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import PaymentProofThumb from "~/components/shared/payment/payment-proof-thumb/index.vue";
import PaymentSummaryRow from "~/components/shared/dialog/payment-summary-row/index.vue";
import { formatMoney } from "~/utils/format/money";
import { transferTotal, visibleFeeAmount } from "~/utils/payment-fee";

defineOptions({ name: "PaymentSuccessDialog" });

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, required: true },
  summary: { type: Object, default: null },
  referenceLabel: { type: String, required: true },
  referenceValue: { type: [String, Number], default: "" },
  referenceValueClass: {
    type: String,
    default: "text-sm font-bold text-slate-900 break-all",
  },
  productAmount: { type: [Number, String], default: 0 },
  amountLabel: { type: String, default: "سعر المنتج" },
  showStudyYear: { type: Boolean, default: true },
  /** `before-price` places the method above سعر المنتج. `after-fee` places it under رسوم التحويل. */
  methodPosition: {
    type: String,
    default: "before-price",
    validator: (value) => ["before-price", "after-fee"].includes(value),
  },
});

const emit = defineEmits(["update:visible", "close"]);

const feeAmount = computed(() => visibleFeeAmount(props.summary?.feeAmount));
const payableTotal = computed(() =>
  transferTotal(props.productAmount, feeAmount.value),
);

const onClose = () => {
  emit("update:visible", false);
  emit("close");
};
</script>
