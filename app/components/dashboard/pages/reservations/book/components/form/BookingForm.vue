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
      :is-customer-service="isCustomerService"
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
        @submit="handleSubmit"
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
          @apply-student="applyStudent"
          @clear-student="clearStudent"
          @branch-change="onBranchChange"
          @study-year-change="onStudyYearChange"
          @teacher-change="onTeacherChange"
          @product-type-change="onProductTypeChange"
          @product-search="onProductSearch"
          @set-payment-fields-ref="setPaymentFieldsRef"
        />

        <div class="md:col-span-2 flex justify-center">
          <FormSubmitButton
            data-testid="booking-submit"
            :label="submitLabel"
            :loading="saving"
            :valid="meta.valid"
            button-class="min-w-[220px]"
          />
        </div>
      </Form>
    </div>

    <ReservationSuccessDialog
      v-if="successDialogVisible"
      v-model:visible="successDialogVisible"
      :summary="reservationSummary"
      @close="closeSuccessDialog"
    />
  </div>
</template>

<script setup>
import FormSubmitButton from "~/components/shared/form-submit-button/index.vue";
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
const ReservationSuccessDialog = defineAsyncComponent(
  () => import("~/components/shared/dialog/reservation-success-dialog/index.vue"),
);

const props = defineProps({
  title: { type: String, default: "حجز منتج" },
  submitLabel: { type: String, default: "تأكيد الحجز" },
  showHeader: { type: Boolean, default: false },
  backTo: { type: String, default: "" },
  initialProduct: { type: [String, Number], default: "" },
  /** Prefill from CS product search (product + optional branch). */
  initialSelection: { type: Object, default: null },
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
  onProductTypeChange,
  saving,
  reservationSummary,
  successDialogVisible,
  proofFile,
  proofKey,
  proofPreviewUrl,
  proofRequiredError,
  paymentFieldsRef,
  closeSuccessDialog,
  handleSubmit,
  validateStudentSelection,
  applyStudent,
  clearStudent,
} = useBookingForm(props, emit);

const setPaymentFieldsRef = (el) => {
  paymentFieldsRef.value = el || null;
};
</script>
