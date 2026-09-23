<template>
  <Field v-slot="{ field, errorMessage }" name="type" rules="required">
    <AppGlobalSelectProductType
      :model-value="form.type"
      label="نوع المنتج"
      placeholder="اختر النوع ▾"
      :invalid="!!(errorMessage || fieldErrors.type)"
      @update:model-value="
        (value) => {
          form.type = value;
          field.onChange(value);
        }
      "
    />
    <ErrorMessage name="type" class="text-xs text-red-400" />
  </Field>

  <Field
    v-if="requiresStudyYear"
    v-slot="{ errorMessage, handleChange }"
    v-model="form.studyYearId"
    name="studyYearId"
    rules="required"
  >
    <div class="flex flex-col gap-2 text-right">
      <div class="flex items-end gap-2">
        <AppGlobalSelectStudyYear
          :ref="bindStudyYearSelectRef"
          :model-value="form.studyYearId || null"
          label="السنة الدراسية"
          placeholder="اختر السنة الدراسية ▾"
          wrapper-class="min-w-0 flex-1"
          :invalid="!!(errorMessage || fieldErrors.studyYearId)"
          @update:model-value="
            (value) => {
              form.studyYearId = value || '';
              handleChange(value || '');
            }
          "
        />
        <Button
          type="button"
          icon="pi pi-plus"
          severity="primary"
          outlined
          class="mb-0.5"
          aria-label="إضافة سنة دراسية"
          @click="$emit('open-study-year')"
        />
      </div>
      <ErrorMessage name="studyYearId" class="text-xs text-red-400" />
    </div>
  </Field>

  <Field
    v-slot="{ errorMessage }"
    v-model="form.teacherId"
    name="teacherId"
    rules="required"
  >
    <div class="flex flex-col gap-2 text-right">
      <div class="flex items-end gap-2">
        <AppGlobalSelectTeacher
          :ref="bindTeacherSelectRef"
          v-model="form.teacherId"
          label="اختر المدرس"
          placeholder="اختر المدرس ▾"
          wrapper-class="min-w-0 flex-1"
          :query="teacherQuery"
          :invalid="!!(errorMessage || fieldErrors.teacherId)"
          @loaded="$emit('teachers-loaded', $event)"
        />
        <Button
          type="button"
          icon="pi pi-plus"
          severity="primary"
          outlined
          class="mb-0.5"
          aria-label="إضافة مدرس"
          @click="$emit('open-teacher')"
        />
      </div>
      <ErrorMessage name="teacherId" class="text-xs text-red-400" />
    </div>
  </Field>

  <Field v-slot="{ field, errorMessage }" name="name" rules="required">
    <div class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium">اسم المنتج</label>
      <InputText
        v-bind="field"
        v-model="form.name"
        class="w-full"
        :class="{ 'p-invalid': errorMessage || fieldErrors.name }"
      />
      <ErrorMessage name="name" class="text-xs text-red-400" />
    </div>
  </Field>

  <Field
    v-slot="{ errorMessage }"
    v-model="form.purchasePrice"
    name="purchasePrice"
    rules="required|min_value:0.01"
  >
    <div class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium">سعر الشراء / الجملة</label>
      <AppInputNumber
        v-model="form.purchasePrice"
        dataTestid="product-purchase-price"
        mode="currency"
        currency="EGP"
        :min="0"
        :min-fraction-digits="2"
        :use-grouping="true"
        :invalid="!!(errorMessage || fieldErrors.purchasePrice)"
      />
      <ErrorMessage name="purchasePrice" class="text-xs text-red-400" />
    </div>
  </Field>

  <Field
    v-slot="{ errorMessage }"
    v-model="form.sellingPrice"
    name="sellingPrice"
    rules="required|min_value:0.01"
  >
    <div class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium">سعر البيع</label>
      <AppInputNumber
        v-model="form.sellingPrice"
        mode="currency"
        currency="EGP"
        :min="0"
        :min-fraction-digits="2"
        :use-grouping="true"
        :invalid="!!(errorMessage || fieldErrors.sellingPrice)"
      />
      <ErrorMessage name="sellingPrice" class="text-xs text-red-400" />
    </div>
  </Field>

  <Field
    v-slot="{ errorMessage }"
    v-model="form.minStockQuantity"
    name="minStockQuantity"
    label="حد تنبيه المخزون"
    rules="min_value:0"
  >
    <div class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium">حد تنبيه المخزون</label>
      <AppInputNumber
        v-model="form.minStockQuantity"
        :min="0"
        :min-fraction-digits="0"
        :max-fraction-digits="0"
        :use-grouping="false"
        :invalid="!!(errorMessage || fieldErrors.minStockQuantity)"
      />
      <p class="text-xs text-slate-500">
        عند وصول كمية المخزون لهذا الرقم أو أقل، سيتم إرسال تنبيه بنقص المخزون.
      </p>
      <ErrorMessage name="minStockQuantity" class="text-xs text-red-400" />
    </div>
  </Field>

  <div
    class="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 text-right"
    data-testid="product-profit-percentage"
  >
    نسبة الربح المحسوبة:
    <span class="font-semibold text-slate-900">{{ profitPercentage }}%</span>
  </div>

  <div class="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3">
    <div class="text-right">
      <p class="text-sm font-medium text-slate-800">السماح بالحجز</p>
      <p class="text-xs text-slate-500">تفعيل إمكانية حجز هذا المنتج</p>
    </div>
    <ToggleSwitch v-model="form.reservationAllowed" />
  </div>
</template>

<script setup>
import Button from "primevue/button";
import AppGlobalSelectTeacher from "~/components/shared/selections/app-global-select-teacher/index.vue";
import AppGlobalSelectStudyYear from "~/components/shared/selections/app-global-select-study-year/index.vue";
import AppGlobalSelectProductType from "~/components/shared/selections/app-global-select-product-type/index.vue";
import InputText from "primevue/inputtext";
import ToggleSwitch from "primevue/toggleswitch";
import AppInputNumber from "~/components/shared/inputs/app-input-number/index.vue";
import { Field, ErrorMessage } from "vee-validate";

defineProps({
  form: { type: Object, required: true },
  fieldErrors: { type: Object, default: () => ({}) },
  requiresStudyYear: { type: Boolean, default: false },
  teacherQuery: { type: Object, default: () => ({}) },
  profitPercentage: { type: [String, Number], default: "0.00" },
  bindTeacherSelectRef: { type: Function, required: true },
  bindStudyYearSelectRef: { type: Function, required: true },
});

defineEmits(["open-teacher", "open-study-year", "teachers-loaded"]);
</script>
