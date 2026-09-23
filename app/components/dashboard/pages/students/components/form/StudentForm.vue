<template>
  <Form
    v-slot="{ errors: fieldErrors, meta }"
    :key="formKey"
    :initial-values="initialValues"
    class="grid gap-4"
    @submit="submit"
  >
    <Field v-slot="{ field, errorMessage }" name="name" rules="required">
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">اسم الطالب</label>
        <InputText
          v-bind="field"
          v-model="form.name"
          class="w-full"
          data-testid="student-name"
          :class="{ 'p-invalid': errorMessage || fieldErrors.name }"
        />
        <ErrorMessage name="name" class="text-xs text-red-500" />
      </div>
    </Field>

    <Field v-slot="{ field }" name="phone">
      <AppPhoneInput
        v-model="form.phone"
        label="رقم الهاتف"
        placeholder="رقم الهاتف"
        @update:model-value="field.onChange"
        @blur="field.onBlur"
      />
    </Field>

    <Field
      v-slot="{ value, handleChange, errorMessage }"
      name="studyYearId"
      rules="required"
      :model-value="form.studyYearId"
    >
      <AppGlobalSelectStudyYear
        :model-value="value ?? form.studyYearId"
        label="السنة الدراسية"
        placeholder="اختر السنة الدراسية"
        :invalid="!!(errorMessage || fieldErrors.studyYearId)"
        @update:model-value="
          (next) => {
            form.studyYearId = next;
            handleChange(next);
          }
        "
      />
      <ErrorMessage name="studyYearId" class="text-xs text-red-500" />
    </Field>

    <div class="flex justify-end gap-2">
      <Button type="button" label="إلغاء" severity="secondary" text @click="$emit('cancel')" />
      <FormSubmitButton
        :label="isEdit ? 'حفظ التعديل' : 'إضافة'"
        :loading="saving"
        :valid="meta.valid"
        data-testid="student-submit"
      />
    </div>
  </Form>
</template>

<script setup>
import Button from "primevue/button";
import FormSubmitButton from "~/components/shared/form-submit-button/index.vue";
import AppGlobalSelectStudyYear from "~/components/shared/selections/app-global-select-study-year/index.vue";
import InputText from "primevue/inputtext";
import AppPhoneInput from "~/components/shared/inputs/app-phone-input/index.vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import {
  studentApi,
  emptyStudentForm,
  mapStudentToForm,
  buildStudentPayload,
  validateStudentForm,
} from "~/services/student";
import { useAppToast } from "~/composables/useAppToast";
import { useAcademicYear } from "~/composables/useAcademicYear";

const { showError } = useAppToast();
const { academicYearId: currentAcademicYearId } = useAcademicYear();

const props = defineProps({
  student: { type: Object, default: null },
});

const emit = defineEmits(["saved", "cancel"]);

const saving = ref(false);
const formKey = ref(0);
const isEdit = computed(() => Boolean(props.student?.id));

const form = reactive(emptyStudentForm());
const initialValues = reactive(emptyStudentForm());

watch(
  () => props.student,
  (value) => {
    const next = mapStudentToForm(value);
    Object.assign(form, next);
    Object.assign(initialValues, next);
    formKey.value += 1;
  },
  { immediate: true },
);

const submit = async () => {
  const validationError = validateStudentForm(form, {
    isEdit: isEdit.value,
    currentAcademicYearId: currentAcademicYearId.value,
  });
  if (validationError) {
    showError(validationError);
    return;
  }

  saving.value = true;
  try {
    const payload = buildStudentPayload(form, {
      isEdit: isEdit.value,
      currentAcademicYearId: currentAcademicYearId.value,
    });
    const result = isEdit.value
      ? await studentApi.updateStudent(props.student.id, payload)
      : await studentApi.createStudent(payload);
    emit("saved", result);
  } catch (error) {
    showError(error?.message || "تعذر حفظ الطالب.");
  } finally {
    saving.value = false;
  }
};
</script>
