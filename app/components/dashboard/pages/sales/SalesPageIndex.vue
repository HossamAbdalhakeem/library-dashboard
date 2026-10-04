<template>
  <div class="min-w-0 space-y-6" dir="rtl">
    <Card
      class="min-w-0 overflow-hidden"
      :pt="{
        body: { class: 'min-w-0' },
        content: { class: 'min-w-0' },
      }"
    >
      <template #title>
        <span class="text-lg font-bold text-slate-900">البيع المباشر</span>
      </template>

      <template #content>
        <Form
          class="block w-full min-w-0"
          v-slot="{ errors: fieldErrors, setFieldValue, meta }"
          :key="sales.formKey"
          :initial-values="sales.formInitialValues"
          @submit="sales.requestSubmit"
          @invalid-submit="sales.flagMissingProof"
        >
          <SalesFormFields
            :sales="sales"
            :field-errors="fieldErrors"
            :set-field-value="setFieldValue"
            :meta="meta"
          />
        </Form>
      </template>
    </Card>

    <PaymentConfirmDialog
      v-model:visible="sales.confirmDialogVisible"
      :saving="sales.saving"
      header="تأكيد البيع"
      confirm-label="تأكيد البيع"
      lead="تأكيد تسجيل بيع"
      :summary="{
        productName: sales.selectedProductOption?.name,
        teacherName: sales.selectedProductOption?.teacherName,
        studentName: sales.form.studentName,
        productAmount: sales.requiredAmount,
        feeAmount: sales.resolvedFeeAmount(),
      }"
      @confirm="sales.submitSale"
    >
      <template #extra>
        <PaymentSummaryRow label="الكمية" :value="sales.form.quantity" />
      </template>
    </PaymentConfirmDialog>

    <PaymentSuccessDialog
      v-model:visible="sales.successDialogVisible"
      title="تم تسجيل البيع بنجاح"
      reference-label="رقم الدفع"
      :reference-value="sales.saleSummary?.paymentNumber"
      :summary="sales.saleSummary"
      :product-amount="sales.saleSummary?.totalAmount"
      @close="sales.closeSuccessDialog"
    >
      <template #extra>
        <PaymentSummaryRow label="الكمية" :value="sales.saleSummary?.quantity" />
        <PaymentSummaryRow
          label="سعر الوحدة"
          :value="formatMoney(sales.saleSummary?.unitPrice)"
        />
      </template>
      <template #footer>
        <div class="flex w-full flex-wrap justify-center gap-2">
          <Button
            label="إجراء عملية أخرى"
            class="min-w-[140px]"
            @click="sales.startAnotherSale"
          />
          <Button
            label="إغلاق"
            severity="secondary"
            class="min-w-[120px]"
            @click="sales.closeSuccessDialog"
          />
        </div>
      </template>
    </PaymentSuccessDialog>
  </div>
</template>

<script setup>
import Button from "primevue/button";
import Card from "primevue/card";
import { Form } from "vee-validate";
import { useSalesPage } from "./composables/useSalesPage";
import SalesFormFields from "~/components/dashboard/pages/sales/components/partials/SalesFormFields.vue";
import PaymentConfirmDialog from "~/components/shared/dialog/payment-confirm-dialog/index.vue";
import PaymentSuccessDialog from "~/components/shared/dialog/payment-success-dialog/index.vue";
import PaymentSummaryRow from "~/components/shared/dialog/payment-summary-row/index.vue";
import { formatMoney } from "~/utils/format/money";

const sales = useSalesPage();
</script>
