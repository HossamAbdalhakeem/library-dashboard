<template>
  <Field
    v-slot="{ errorMessage }"
    class="md:col-span-2"
    name="studentId"
    :rules="validateStudentSelection"
  >
    <div class="flex flex-col gap-2 text-right">
      <AppGlobalSelectStudent
        v-model="selectedStudentModel"
        :variant="isCustomerService ? 'dark' : 'default'"
        :label-class="isCustomerService ? 'text-slate-200' : 'text-slate-700'"
        :invalid="!!(errorMessage || fieldErrors.studentId)"
        @select="(student) => $emit('apply-student', student, setFieldValue)"
        @created="(student) => $emit('apply-student', student, setFieldValue)"
        @clear="() => $emit('clear-student', setFieldValue)"
      />
      <ErrorMessage name="studentId" class="text-xs text-red-500" />
    </div>
  </Field>

  <Field
    v-if="isCustomerService"
    v-slot="{ errorMessage }"
    v-model="form.branchId"
    class="md:col-span-2"
    name="branchId"
    label="الفرع"
    rules="required"
  >
    <div class="flex flex-col gap-2 text-right">
      <AppGlobalSelectBranch
        v-model="form.branchId"
        label="اختيار الفرع"
        placeholder="اختر الفرع"
        :invalid="!!(errorMessage || fieldErrors.branchId)"
        @change="$emit('branch-change', $event)"
      />
      <ErrorMessage name="branchId" class="text-xs text-red-500" />
    </div>
  </Field>

  <Field
    v-slot="{ errorMessage }"
    v-model="form.studyYearId"
    name="studyYearId"
    rules="required"
  >
    <div class="flex flex-col gap-2 text-right">
      <AppGlobalSelectStudyYear
        v-model="form.studyYearId"
        label="السنة الدراسية"
        placeholder="اختر السنة الدراسية"
        :label-class="isCustomerService ? 'text-slate-200' : 'text-slate-700'"
        :invalid="!!(errorMessage || fieldErrors.studyYearId)"
        @change="$emit('study-year-change', $event)"
      />
      <ErrorMessage name="studyYearId" class="text-xs text-red-500" />
    </div>
  </Field>

  <Field
    v-slot="{ errorMessage }"
    v-model="form.teacherId"
    name="teacherId"
    rules="required"
  >
    <div class="flex flex-col gap-2 text-right">
      <AppGlobalSelectTeacher
        v-model="form.teacherId"
        label="المدرس"
        placeholder="اختر المدرس"
        :disabled="!form.studyYearId"
        :label-class="isCustomerService ? 'text-slate-200' : 'text-slate-700'"
        :invalid="!!(errorMessage || fieldErrors.teacherId)"
        @change="$emit('teacher-change', $event)"
      />
      <ErrorMessage name="teacherId" class="text-xs text-red-500" />
    </div>
  </Field>

  <Field
    v-slot="{ errorMessage }"
    v-model="form.productType"
    name="productType"
    rules="required"
  >
    <div class="flex flex-col gap-2 text-right">
      <AppGlobalSelectProductType
        v-model="form.productType"
        label="نوع المنتج"
        placeholder="اختر النوع"
        :disabled="!form.teacherId"
        :label-class="isCustomerService ? 'text-slate-200' : 'text-slate-700'"
        :invalid="!!(errorMessage || fieldErrors.productType)"
        @change="$emit('product-type-change', $event)"
      />
      <ErrorMessage name="productType" class="text-xs text-red-500" />
    </div>
  </Field>

  <Field
    v-slot="{ errorMessage }"
    v-model="form.productId"
    name="productId"
    label="المنتج"
    rules="required"
  >
    <div class="flex flex-col gap-2 text-right">
      <AppGlobalSelectProduct
        v-model="form.productId"
        :options="productOptions"
        :loading="loadingProducts"
        :disabled="!canSelectProduct"
        :invalid="!!(errorMessage || fieldErrors.productId)"
        :hint="productSelectHint"
        @search="$emit('product-search', $event)"
      />
      <ErrorMessage name="productId" class="text-xs text-red-500" />
    </div>
  </Field>

  <ProductPriceBanner
    v-if="selectedProductOption"
    :amount="productDisplayPrice"
    :label="selectedProductOption?.priceKindLabel || 'مبلغ المنتج'"
  />

  <BookingFormAmountField
    v-model="form.amount"
    :field-errors="fieldErrors"
    :product-deposit-cap="productDepositCap"
    :amount-error="amountError"
  />

  <div class="md:col-span-2">
    <Field
      v-slot="{ errorMessage }"
      v-model="form.paymentMethod"
      name="paymentMethod"
      rules="required"
    >
      <PaymentFields
        :ref="(el) => $emit('set-payment-fields-ref', el)"
        v-model:method="form.paymentMethod"
        v-model:image="proofFileModel"
        v-model:image-data-url="proofKeyModel"
        v-model:image-preview-url="proofPreviewUrlModel"
        :exclude="paymentExclude"
        :method-invalid="!!errorMessage"
        :method-error="errorMessage || ''"
        :image-invalid="proofRequiredError"
      />
    </Field>
  </div>
</template>

<script setup>
import PaymentFields from "~/components/shared/payment/payment-fields/index.vue";
import AppGlobalSelectProduct from "~/components/shared/selections/app-global-select-product/index.vue";
import AppGlobalSelectStudent from "~/components/shared/selections/app-global-select-student/index.vue";
import AppGlobalSelectBranch from "~/components/shared/selections/app-global-select-branch/index.vue";
import AppGlobalSelectStudyYear from "~/components/shared/selections/app-global-select-study-year/index.vue";
import AppGlobalSelectTeacher from "~/components/shared/selections/app-global-select-teacher/index.vue";
import AppGlobalSelectProductType from "~/components/shared/selections/app-global-select-product-type/index.vue";
import { Field, ErrorMessage } from "vee-validate";
import ProductPriceBanner from "~/components/shared/product-price-banner/index.vue";
import BookingFormAmountField from "./BookingFormAmountField.vue";

defineOptions({ name: "BookingFormFields" });

defineProps({
  form: { type: Object, required: true },
  fieldErrors: { type: Object, default: () => ({}) },
  setFieldValue: { type: Function, required: true },
  isCustomerService: { type: Boolean, default: false },
  validateStudentSelection: { type: Function, required: true },
  productOptions: { type: Array, default: () => [] },
  loadingProducts: { type: Boolean, default: false },
  canSelectProduct: { type: Boolean, default: false },
  productSelectHint: { type: String, default: "" },
  selectedProductOption: { type: Object, default: null },
  productDisplayPrice: { type: Number, default: 0 },
  productDepositCap: { type: Number, default: 0 },
  amountError: { type: String, default: "" },
  paymentExclude: { type: Array, default: () => [] },
  proofRequiredError: { type: Boolean, default: false },
});

const selectedStudentModel = defineModel("selectedStudent", { default: null });
const proofFileModel = defineModel("proofFile", { default: null });
const proofKeyModel = defineModel("proofKey", { type: String, default: "" });
const proofPreviewUrlModel = defineModel("proofPreviewUrl", {
  type: String,
  default: "",
});

defineEmits([
  "apply-student",
  "clear-student",
  "branch-change",
  "study-year-change",
  "teacher-change",
  "product-type-change",
  "product-search",
  "set-payment-fields-ref",
]);
</script>
