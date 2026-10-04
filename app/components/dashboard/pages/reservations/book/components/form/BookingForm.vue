<template>
  <div class="relative space-y-4" dir="rtl">
    <BookingFormOverlay
      v-if="hydratingInitial"
      :is-customer-service="isCustomerService"
    />

    <BookingFormHeader
      v-if="showHeader"
      :title="title"
      :back-to="backTo"
    >
      <template #header-actions>
        <slot name="header-actions" />
      </template>
    </BookingFormHeader>

    <div class="grid gap-4">
      <Form
        v-slot="{ errors: fieldErrors, setFieldValue, meta }"
        :key="formKey"
        :initial-values="formInitialValues"
        class="grid gap-4 md:grid-cols-2"
        @submit="requestSubmit"
        @invalid-submit="flagMissingProof"
      >
        <BookingFormFields
          v-model:selected-student="selectedStudent"
          v-model:proof-file="proofFile"
          v-model:proof-key="proofKey"
          v-model:proof-preview-url="proofPreviewUrl"
          :form="form"
          :field-errors="fieldErrors"
          :set-field-value="setFieldValue"
          :is-customer-service="isCustomerService"
          :validate-student-selection="validateStudentSelection"
          :product-options="productOptions"
          :loading-products="loadingProducts"
          :can-select-product="canSelectProduct"
          :product-select-hint="productSelectHint"
          :selected-product-option="selectedProductOption"
          :product-display-price="productDisplayPrice"
          :product-deposit-cap="productDepositCap"
          :amount-error="amountError"
          :payment-exclude="paymentExclude"
          :proof-required-error="proofRequiredError"
          :show-proof-source-choice="showProofSourceChoice"
          @apply-student="applyStudent"
          @clear-student="clearStudent"
          @branch-change="onBranchChange"
          @study-year-change="onStudyYearChange"
          @teacher-change="onTeacherChange"
          @product-search="onProductSearch"
          @set-payment-fields-ref="setPaymentFieldsRef"
        />

        <div class="md:col-span-2 flex justify-center">
          <FormSubmitButton
            :label="submitLabel"
            :loading="saving"
            :valid="meta.valid && bookingPaymentReady"
            button-class="w-full min-w-0 sm:w-auto sm:min-w-[220px]"
          />
        </div>
      </Form>
    </div>

    <PaymentConfirmDialog
      v-model:visible="confirmDialogVisible"
      :saving="saving"
      header="تأكيد الحجز"
      confirm-label="تأكيد الحجز"
      lead="تأكيد حجز"
      :summary="{
        productName: selectedProductOption?.name,
        teacherName: selectedProductOption?.teacherName,
        studentName: form.studentName,
        productAmount: form.amount,
        feeAmount: resolvedFeeAmount(),
      }"
      @confirm="handleSubmit"
    />

    <PaymentSuccessDialog
      v-model:visible="successDialogVisible"
      title="تم تسجيل الحجز بنجاح"
      reference-label="رقم الحجز"
      :reference-value="reservationSummary?.reservationNumber"
      reference-value-class="text-xl font-extrabold tracking-wide text-emerald-700 break-all"
      :summary="reservationSummary"
      :product-amount="reservationSummary?.paidAmount"
      method-position="after-fee"
      @close="closeSuccessDialog"
    >
      <template #footnote>
        احتفظ برقم الحجز لتسليم الكتاب لاحقًا
      </template>
    </PaymentSuccessDialog>
  </div>
</template>

<script setup>
import FormSubmitButton from "~/components/shared/form-submit-button/index.vue";
import PaymentConfirmDialog from "~/components/shared/dialog/payment-confirm-dialog/index.vue";
import PaymentSuccessDialog from "~/components/shared/dialog/payment-success-dialog/index.vue";
import { paymentMethodNeedsProof } from "~/enums/paymentMethod";
import { Form } from "vee-validate";
import { useBookingForm } from "./composables/useBookingForm";

defineOptions({ name: "BookingForm" });

const BookingFormOverlay = defineAsyncComponent(
  () => import("./partials/BookingFormOverlay.vue"),
);
const BookingFormHeader = defineAsyncComponent(
  () => import("./partials/BookingFormHeader.vue"),
);
const BookingFormFields = defineAsyncComponent(
  () => import("./partials/BookingFormFields.vue"),
);
const props = defineProps({
  title: { type: String, default: "حجز منتج" },
  submitLabel: { type: String, default: "تأكيد الحجز" },
  showHeader: { type: Boolean, default: false },
  backTo: { type: String, default: "" },
  initialProduct: { type: [String, Number], default: "" },
  /** Prefill from CS product search (product + optional branch). */
  initialSelection: { type: Object, default: null },
  showProofSourceChoice: { type: Boolean, default: false },
  submitFn: { type: Function, required: true },
});

const emit = defineEmits(["hydrating", "reset"]);

const {
  isCustomerService,
  hydratingInitial,
  selectedStudent,
  paymentExclude,
  form,
  formInitialValues,
  formKey,
  loadingProducts,
  amountError,
  canSelectProduct,
  productSelectHint,
  productOptions,
  selectedProductOption,
  productDisplayPrice,
  productDepositCap,
  onProductSearch,
  onBranchChange,
  onStudyYearChange,
  onTeacherChange,
  saving,
  reservationSummary,
  successDialogVisible,
  confirmDialogVisible,
  proofFile,
  proofKey,
  proofPreviewUrl,
  proofRequiredError,
  paymentFieldsRef,
  closeSuccessDialog,
  requestSubmit,
  resolvedFeeAmount,
  handleSubmit,
  flagMissingProof,
  validateStudentSelection,
  applyStudent,
  clearStudent,
} = useBookingForm(props, emit);

const setPaymentFieldsRef = (el) => {
  paymentFieldsRef.value = el || null;
};

const bookingPaymentReady = computed(() => {
  if (!paymentMethodNeedsProof(form.paymentMethod)) return true;
  return Boolean(proofKey.value);
});
</script>
