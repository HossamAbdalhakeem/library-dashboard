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
        <label class="text-sm font-medium text-slate-700">اسم العام الدراسي</label>
        <InputText
          v-bind="field"
          v-model="form.name"
          class="w-full"
          placeholder="مثال: 2025/2026"
          :disabled="isEdit"
          :class="{ 'p-invalid': errorMessage || fieldErrors.name }"
        />
        <p v-if="isEdit" class="text-xs text-slate-500">
          لا يمكن تعديل اسم العام الدراسي بعد إنشائه.
        </p>
        <ErrorMessage name="name" class="text-xs text-red-500" />
      </div>
    </Field>

    <Field
      v-slot="{ errorMessage }"
      v-model="form.startDate"
      name="startDate"
      rules="required"
    >
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">تاريخ البداية</label>
        <DatePicker
          v-model="form.startDate"
          dateFormat="yy-mm-dd"
          showIcon
          class="w-full"
          :class="{ 'p-invalid': errorMessage || fieldErrors.startDate }"
        />
        <ErrorMessage name="startDate" class="text-xs text-red-500" />
      </div>
    </Field>

    <Field
      v-slot="{ errorMessage }"
      v-model="form.endDate"
      name="endDate"
      rules="required"
    >
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">تاريخ النهاية</label>
        <DatePicker
          v-model="form.endDate"
          dateFormat="yy-mm-dd"
          showIcon
          class="w-full"
          :class="{ 'p-invalid': errorMessage || fieldErrors.endDate }"
        />
        <ErrorMessage name="endDate" class="text-xs text-red-500" />
      </div>
    </Field>

    <div
      v-if="isEdit && !isActive"
      class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-right"
    >
      <p class="text-sm font-medium text-emerald-800">تفعيل هذا العام الدراسي؟</p>
      <p class="mt-1 text-xs text-emerald-700">
        سيتم إلغاء تفعيل أي عام نشط آخر تلقائياً.
      </p>
      <Button
        type="button"
        class="mt-3"
        label="تفعيل العام الدراسي"
        severity="success"
        :loading="activating"
        @click="activate"
      />
    </div>

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
import DatePicker from "primevue/datepicker";
import { Form, Field, ErrorMessage } from "vee-validate";
import { academicYearService } from "~/services/academicYearService";
import { useAppToast } from "~/composables/useAppToast";

defineOptions({ name: "AcademicYearForm" });

const { showError } = useAppToast();

const props = defineProps({
  academicYear: { type: Object, default: null },
});

const emit = defineEmits(["saved", "cancel"]);

const saving = ref(false);
const activating = ref(false);
const formKey = ref(0);
const isEdit = computed(() => Boolean(props.academicYear?.id));
const isActive = computed(
  () => String(props.academicYear?.status || "").toUpperCase() === "ACTIVE",
);

const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  return new Date(value);
};

const toIsoDate = (value) => {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const form = reactive({
  name: "",
  startDate: null,
  endDate: null,
});

const initialValues = computed(() => ({
  name: props.academicYear?.name || "",
  startDate: toDate(props.academicYear?.startDate),
  endDate: toDate(props.academicYear?.endDate),
}));

watch(
  () => props.academicYear,
  (value) => {
    form.name = value?.name || "";
    form.startDate = toDate(value?.startDate);
    form.endDate = toDate(value?.endDate);
    formKey.value += 1;
  },
  { immediate: true },
);

const submit = async () => {
  saving.value = true;
  try {
    const startDate = toIsoDate(form.startDate);
    const endDate = toIsoDate(form.endDate);
    if (!startDate || !endDate) {
      throw new Error("تاريخ البداية والنهاية مطلوبان.");
    }
    if (new Date(endDate) < new Date(startDate)) {
      throw new Error("تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية.");
    }

    const result = isEdit.value
      ? await academicYearService.updateAcademicYear(props.academicYear.id, {
          startDate,
          endDate,
        })
      : await academicYearService.createAcademicYear({
          name: form.name,
          startDate,
          endDate,
        });

    emit("saved", result);
  } catch (error) {
    showError(error?.message || "تعذر حفظ العام الدراسي.");
  } finally {
    saving.value = false;
  }
};

const activate = async () => {
  if (!props.academicYear?.id) return;
  activating.value = true;
  try {
    const result = await academicYearService.activateAcademicYear(
      props.academicYear.id,
    );
    emit("saved", result);
  } catch (error) {
    showError(error?.message || "تعذر تفعيل العام الدراسي.");
  } finally {
    activating.value = false;
  }
};
</script>
