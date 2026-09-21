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
import InputText from "primevue/inputtext";
import { Form, Field, ErrorMessage } from "vee-validate";
import { studyYearService } from "~/services/studyYearService";
import { useAppToast } from "~/composables/useAppToast";

const { showError } = useAppToast();

const props = defineProps({
  studyYear: { type: Object, default: null },
});

const emit = defineEmits(["saved", "cancel"]);

const saving = ref(false);
const formKey = ref(0);
const isEdit = computed(() => Boolean(props.studyYear?.id));

const form = reactive({ name: "" });
const initialValues = computed(() => ({ name: props.studyYear?.name || "" }));

watch(
  () => props.studyYear,
  (value) => {
    form.name = value?.name || "";
    formKey.value += 1;
  },
  { immediate: true },
);

const submit = async () => {
  saving.value = true;
  try {
    const result = isEdit.value
      ? await studyYearService.updateStudyYear(props.studyYear.id, { name: form.name })
      : await studyYearService.createStudyYear({ name: form.name });
    emit("saved", result);
  } catch (error) {
    showError(error?.message || "تعذر حفظ السنة الدراسية.");
  } finally {
    saving.value = false;
  }
};
</script>
