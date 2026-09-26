<template>
  <div class="grid gap-4 md:grid-cols-2">
    <Field
      v-slot="{ errorMessage }"
      class="md:col-span-2"
      name="studentId"
      :rules="sales.validateStudentSelection"
    >
      <div class="flex flex-col gap-2 text-right">
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
      <div class="flex flex-col gap-2 text-right">
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
      <div class="flex flex-col gap-2 text-right">
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
      <div class="flex flex-col gap-2 text-right">
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
      <div class="flex flex-col gap-2 text-right">
        <div class="flex items-center justify-between gap-2">
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
          data-testid="sale-quantity"
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

    <div class="md:col-span-2">
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
          :method-invalid="!!(errorMessage || fieldErrors.method)"
          :method-error="errorMessage || ''"
          :image-invalid="sales.proofRequiredError"
          @change="sales.onPaymentChange"
        />
      </Field>
    </div>

    <div class="md:col-span-2 flex justify-center">
      <FormSubmitButton
        data-testid="sale-submit"
        label="تأكيد البيع"
        :loading="sales.saving"
        :valid="meta.valid"
        button-class="min-w-[200px]"
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

const props = defineProps({
  sales: { type: Object, required: true },
  fieldErrors: { type: Object, required: true },
  setFieldValue: { type: Function, required: true },
  meta: { type: Object, required: true },
});

const setPaymentFieldsRef = (el) => {
  props.sales.setPaymentFieldsRef?.(el);
};
</script>
