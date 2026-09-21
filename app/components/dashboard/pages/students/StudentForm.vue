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
          :class="{ 'p-invalid': errorMessage || fieldErrors.name }"
        />
        <ErrorMessage name="name" class="text-xs text-red-500" />
      </div>
    </Field>

    <Field v-slot="{ field }" name="phone">
      <PhoneInput
        v-model="form.phone"
        label="رقم الهاتف"
        placeholder="رقم الهاتف"
        @update:model-value="field.onChange"
        @blur="field.onBlur"
      />
    </Field>

    <Field
      v-slot="{ errorMessage }"
      v-model="form.studyYearId"
      name="studyYearId"
      rules="required"
    >
      <AppGlobalSelectStudyYear
        v-model="form.studyYearId"
        label="السنة الدراسية"
        placeholder="اختر السنة الدراسية"
        :invalid="!!(errorMessage || fieldErrors.studyYearId)"
      />
      <ErrorMessage name="studyYearId" class="text-xs text-red-500" />
    </Field>

    <div class="flex justify-end gap-2">
      <Button type="button" label="إلغاء" severity="secondary" text @click="$emit('cancel')" />
      <FormSubmitButton
        :label="isEdit ? 'حفظ التعديل' : 'إضافة'"
        :loading="saving"
        :valid="meta.valid"
      />
    </div>
  </Form>
</template>

<script setup>
import Button from "primevue/button";
import FormSubmitButton from "~/components/shared/form-submit-button/index.vue";
import AppGlobalSelectStudyYear from "~/components/shared/app-global-select-study-year/index.vue";
import InputText from "primevue/inputtext";
import PhoneInput from "~/components/shared/phone-input/index.vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import { studentService } from "~/services/studentService";
import { useAppToast } from "~/composables/useAppToast";
import { useAcademicYearId } from "~/composables/useAcademicYearId";

const { showError } = useAppToast();
const { academicYearId: currentAcademicYearId } = useAcademicYearId();

const props = defineProps({
  student: { type: Object, default: null },
});

const emit = defineEmits(["saved", "cancel"]);

const saving = ref(false);
const formKey = ref(0);
const isEdit = computed(() => Boolean(props.student?.id));

const form = reactive({
  name: "",
  phone: "",
  studyYearId: null,
});

const initialValues = computed(() => ({
  name: props.student?.name || "",
  phone: props.student?.phone || "",
  studyYearId:
    props.student?.studyYearId || props.student?.studyYear?.id || null,
}));

watch(
  () => props.student,
  (value) => {
    form.name = value?.name || "";
    form.phone = value?.phone || "";
    form.studyYearId = value?.studyYearId || value?.studyYear?.id || null;
    formKey.value += 1;
  },
  { immediate: true },
);

const submit = async () => {
  if (!form.studyYearId) {
    showError("السنة الدراسية مطلوبة.");
    return;
  }

  if (!isEdit.value && !currentAcademicYearId.value) {
    showError("اختر العام الدراسي أولاً.");
    return;
  }

  saving.value = true;
  try {
    const payload = {
      name: form.name,
      phone: form.phone || undefined,
      studyYearId: form.studyYearId,
    };
    if (!isEdit.value) {
      payload.academicYearId = currentAcademicYearId.value;
    }
    const result = isEdit.value
      ? await studentService.updateStudent(props.student.id, payload)
      : await studentService.createStudent(payload);
    emit("saved", result);
  } catch (error) {
    showError(error?.message || "تعذر حفظ الطالب.");
  } finally {
    saving.value = false;
  }
};
</script>
