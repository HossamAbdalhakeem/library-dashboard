<template>
  <div class="sales-form grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
    <Field
      v-slot="{ errorMessage }"
      name="studentId"
      :rules="sales.validateStudentSelection"
    >
      <div class="flex w-full min-w-0 flex-col gap-2 text-right md:col-span-2">
        <AppGlobalSelectStudent
          v-model="sales.selectedStudent"
          :invalid="!!(errorMessage || fieldErrors.studentId)"
          @select="(student) => sales.applyStudent(student, setFieldValue)"
          @created="(student) => sales.applyStudent(student, setFieldValue)"
          @clear="() => sales.clearStudent(setFieldValue)"
        />
        <ErrorMessage name="studentId" class="text-xs text-red-500" />
      </div>
    </Field>

    <Field
      v-slot="{ errorMessage }"
      v-model="sales.form.teacherId"
      name="teacherId"
      rules="required"
    >
      <div class="flex w-full min-w-0 flex-col gap-2 text-right">
        <AppGlobalSelectTeacher
          v-model="sales.form.teacherId"
          label="المدرس"
          placeholder="اختر المدرس"
          :invalid="!!(errorMessage || fieldErrors.teacherId)"
          @change="sales.onTeacherChange"
        />
        <ErrorMessage name="teacherId" class="text-xs text-red-500" />
      </div>
    </Field>

    <Field
      v-slot="{ errorMessage }"
      v-model="sales.form.studyYearId"
      name="studyYearId"
      rules="required"
    >
      <div class="flex w-full min-w-0 flex-col gap-2 text-right">
        <AppGlobalSelectStudyYear
          v-model="sales.form.studyYearId"
          label="السنة الدراسية"
          placeholder="اختر السنة الدراسية"
          :disabled="!sales.form.teacherId"
          :invalid="!!(errorMessage || fieldErrors.studyYearId)"
          @change="sales.onStudyYearChange"
        />
        <ErrorMessage name="studyYearId" class="text-xs text-red-500" />
      </div>
    </Field>

    <Field
      v-slot="{ errorMessage }"
      v-model="sales.form.productId"
      name="productId"
      label="المنتج"
      rules="required"
    >
      <div class="flex w-full min-w-0 flex-col gap-2 text-right">
        <AppGlobalSelectProduct
          v-model="sales.form.productId"
          :options="sales.productOptions"
          :loading="sales.loadingProducts"
          :disabled="!sales.canSelectProduct"
          placeholder="اختر المنتج"
          :hint="sales.productSelectHint"
          :invalid="!!(errorMessage || fieldErrors.productId)"
          @change="sales.onProductChange"
          @search="sales.onProductSearch"
        />
        <ErrorMessage name="productId" class="text-xs text-red-500" />
      </div>
    </Field>

    <Field
      v-slot="{ errorMessage }"
      v-model="sales.form.quantity"
      name="quantity"
      rules="required|min_value:1"
    >
      <div class="flex w-full min-w-0 flex-col gap-2 text-right">
        <div class="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <label class="text-sm font-medium text-slate-700">الكمية</label>
          <span
            v-if="sales.selectedProductOption"
            class="rounded-full bg-primary-500/10 px-2.5 py-0.5 text-xs font-semibold text-primary-700"
          >
            المتاح للبيع: {{ sales.selectedProductOption.availableQuantity }}
          </span>
        </div>
        <AppInputNumber
          v-model="sales.form.quantity"
          :min="1"
          :max="sales.maxQuantity"
          :max-fraction-digits="0"
          :invalid="
            !!(errorMessage || fieldErrors.quantity || sales.quantityError)
          "
        />
        <p v-if="sales.quantityError" class="text-xs text-red-500">
          {{ sales.quantityError }}
        </p>
        <ErrorMessage name="quantity" class="text-xs text-red-500" />
      </div>
    </Field>

    <ProductPriceBanner
      v-if="sales.selectedProductOption"
      :amount="sales.requiredAmount"
    />

    <div class="w-full min-w-0 md:col-span-2">
      <Field
        v-slot="{ errorMessage }"
        v-model="sales.form.method"
        name="method"
        rules="required"
      >
        <PaymentFields
          :ref="setPaymentFieldsRef"
          v-model:method="sales.form.method"
          v-model:image="sales.proofFile"
          v-model:image-data-url="sales.proofKey"
          v-model:image-preview-url="sales.proofPreviewUrl"
          v-model:fee-enabled="sales.feeEnabled"
          v-model:fee-amount="sales.feeAmount"
          show-fee
          :method-invalid="!!(errorMessage || fieldErrors.method)"
          :method-error="errorMessage || ''"
          :image-invalid="sales.proofRequiredError"
          @change="sales.onPaymentChange"
        />
      </Field>
    </div>

    <div class="flex w-full min-w-0 justify-center md:col-span-2">
      <FormSubmitButton
        label="تأكيد البيع"
        :loading="sales.saving"
        :valid="meta.valid && paymentCanContinue"
        button-class="w-full min-w-0 sm:w-auto sm:min-w-[200px]"
      />
    </div>
  </div>
</template>

<script setup>
import AppInputNumber from "~/components/shared/inputs/app-input-number/index.vue";
import PaymentFields from "~/components/shared/payment/payment-fields/index.vue";
import FormSubmitButton from "~/components/shared/form-submit-button/index.vue";
import ProductPriceBanner from "~/components/shared/product-price-banner/index.vue";
import AppGlobalSelectProduct from "~/components/shared/selections/app-global-select-product/index.vue";
import AppGlobalSelectStudent from "~/components/shared/selections/app-global-select-student/index.vue";
import AppGlobalSelectStudyYear from "~/components/shared/selections/app-global-select-study-year/index.vue";
import AppGlobalSelectTeacher from "~/components/shared/selections/app-global-select-teacher/index.vue";
import { Field, ErrorMessage } from "vee-validate";
import { paymentMethodNeedsProof } from "~/enums/paymentMethod";

const props = defineProps({
  sales: { type: Object, required: true },
  fieldErrors: { type: Object, required: true },
  setFieldValue: { type: Function, required: true },
  meta: { type: Object, required: true },
});

const setPaymentFieldsRef = (el) => {
  props.sales.setPaymentFieldsRef?.(el);
};

const paymentCanContinue = computed(() => {
  if (!paymentMethodNeedsProof(props.sales.form.method)) return true;
  return Boolean(props.sales.proofKey);
});
</script>

<style scoped>
.sales-form :deep(.p-select),
.sales-form :deep(.p-autocomplete),
.sales-form :deep(.p-inputnumber),
.sales-form :deep(.p-iconfield) {
  min-width: 0;
  max-width: 100%;
}

.sales-form :deep(.p-select-label) {
  min-width: 0;
}
</style>
