<template>
  <div class="space-y-4" dir="rtl">
    <Form
      v-slot="{ errors: fieldErrors, meta }"
      :key="formKey"
      :initial-values="initialValues"
      class="grid gap-4"
      @submit="submit"
    >
      <ProductFormFields
        :form="form"
        :field-errors="fieldErrors"
        :requires-study-year="requiresStudyYear"
        :teacher-query="teacherQuery"
        :profit-percentage="profitPercentage"
        :bind-teacher-select-ref="bindTeacherSelectRef"
        :bind-study-year-select-ref="bindStudyYearSelectRef"
        @open-teacher="openTeacherDialog"
        @open-study-year="openStudyYearDrawer"
        @teachers-loaded="onTeachersLoaded"
      />

      <div class="flex justify-end gap-2 pt-2">
        <Button type="button" label="إلغاء" severity="secondary" text @click="$emit('cancel')" />
        <FormSubmitButton
          :label="isEdit ? 'تحديث المنتج' : 'حفظ المنتج'"
          :loading="saving"
          :valid="meta.valid"
        />
      </div>
    </Form>

    <ProductFormDrawers
      v-model:show-teacher-drawer="showTeacherDrawer"
      v-model:show-study-year-drawer="showStudyYearDrawer"
      :teacher-create-academic-year-id="teacherCreateAcademicYearId"
      @teacher-saved="onTeacherSaved"
      @study-year-saved="onStudyYearSaved"
    />
  </div>
</template>

<script setup>
import Button from "primevue/button";
import FormSubmitButton from "~/components/shared/form-submit-button/index.vue";
import { Form } from "vee-validate";
import { useProductForm } from "./composables/useProductForm";
import ProductFormFields from "./partials/ProductFormFields.vue";
import ProductFormDrawers from "./partials/ProductFormDrawers.vue";

const props = defineProps({
  product: { type: Object, default: null },
});

const emit = defineEmits(["saved", "cancel"]);

const {
  saving,
  showTeacherDrawer,
  showStudyYearDrawer,
  form,
  initialValues,
  formKey,
  isEdit,
  requiresStudyYear,
  teacherQuery,
  teacherCreateAcademicYearId,
  profitPercentage,
  bindTeacherSelectRef,
  bindStudyYearSelectRef,
  onTeachersLoaded,
  openTeacherDialog,
  openStudyYearDrawer,
  onTeacherSaved,
  onStudyYearSaved,
  submit,
} = useProductForm(props, emit);
</script>
