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
        <label class="text-sm font-medium text-slate-700">اسم السنة الدراسية</label>
        <InputText
          v-bind="field"
          v-model="form.name"
          class="w-full"
          placeholder="مثال: الصف الأول"
          :class="{ 'p-invalid': errorMessage || fieldErrors.name }"
        />
        <ErrorMessage name="name" class="text-xs text-red-500" />
      </div>
    </Field>

    <div
      v-if="isEdit"
      class="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3"
    >
      <div class="text-right">
        <p class="text-sm font-medium text-slate-800">حالة السنة الدراسية</p>
        <p class="text-xs text-slate-500">
          {{ form.isActive ? "نشط" : "غير نشط" }}
        </p>
      </div>
      <ToggleSwitch v-model="form.isActive" />
    </div>

    <div class="flex flex-wrap justify-end gap-2">
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
import InputText from "primevue/inputtext";
import ToggleSwitch from "primevue/toggleswitch";
import { Form, Field, ErrorMessage } from "vee-validate";
import {
  studyYearApi,
  emptyStudyYearForm,
  mapStudyYearToForm,
  buildStudyYearPayload,
} from "~/services/study-year";
import { useAppToast } from "~/composables/useAppToast";

const { showError } = useAppToast();

const props = defineProps({
  studyYear: { type: Object, default: null },
});

const emit = defineEmits(["saved", "cancel"]);

const saving = ref(false);
const formKey = ref(0);
const isEdit = computed(() => Boolean(props.studyYear?.id));

const form = reactive(emptyStudyYearForm());
const initialValues = reactive(emptyStudyYearForm());

watch(
  () => props.studyYear,
  (value) => {
    const next = mapStudyYearToForm(value);
    Object.assign(form, next);
    Object.assign(initialValues, next);
    formKey.value += 1;
  },
  { immediate: true },
);

const submit = async () => {
  saving.value = true;
  try {
    const payload = buildStudyYearPayload(form);
    let result;
    if (isEdit.value) {
      result = await studyYearApi.updateStudyYear(props.studyYear.id, payload);
      const nextStatus = form.isActive ? "ACTIVE" : "INACTIVE";
      if (props.studyYear.status !== nextStatus) {
        result = await studyYearApi.updateStudyYearStatus(props.studyYear.id, {
          status: nextStatus,
        });
      }
    } else {
      result = await studyYearApi.createStudyYear(payload);
    }
    emit("saved", result);
  } catch (error) {
    showError(error?.message || "تعذر حفظ السنة الدراسية.");
  } finally {
    saving.value = false;
  }
};
</script>
