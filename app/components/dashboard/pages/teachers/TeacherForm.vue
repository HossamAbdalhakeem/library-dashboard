<template>
  <div class="space-y-4" dir="rtl">
    <Form
      v-slot="{ errors: fieldErrors, meta }"
      :key="formKey"
      :initial-values="initialValues"
      class="grid gap-4"
      @submit="submit"
    >
      <Field v-slot="{ field, errorMessage }" name="name" rules="required">
        <div class="flex flex-col gap-2 text-right">
          <label class="text-sm font-medium">اسم المدرس</label>
          <InputText
            v-bind="field"
            v-model="form.name"
            class="w-full"
            :class="{ 'p-invalid': errorMessage || fieldErrors.name }"
          />
          <ErrorMessage name="name" class="text-xs text-red-400" />
        </div>
      </Field>

      <div
        v-if="isEdit"
        class="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3"
      >
        <div class="text-right">
          <p class="text-sm font-medium text-slate-800">حالة المدرس</p>
          <p class="text-xs text-slate-500">
            {{ form.isActive ? "نشط" : "غير نشط" }}
          </p>
        </div>
        <ToggleSwitch v-model="form.isActive" />
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          label="إلغاء"
          severity="secondary"
          text
          @click="$emit('cancel')"
        />
        <FormSubmitButton
          :label="isEdit ? 'تحديث المدرس' : 'حفظ المدرس'"
          :loading="saving"
          :valid="meta.valid"
        />
      </div>
    </Form>
  </div>
</template>

<script setup>
import Button from "primevue/button";
import FormSubmitButton from "~/components/shared/form-submit-button/index.vue";
import InputText from "primevue/inputtext";
import ToggleSwitch from "primevue/toggleswitch";
import { Form, Field, ErrorMessage } from "vee-validate";
import { teacherService } from "~/services/teacherService";
import { useAppToast } from "~/composables/useAppToast";
import { useAcademicYearId } from "~/composables/useAcademicYearId";

const { showError } = useAppToast();
const { academicYearId: currentAcademicYearId } = useAcademicYearId();

const props = defineProps({
  teacher: { type: Object, default: null },
  lockedAcademicYearId: { type: [String, Number], default: null },
});

const emit = defineEmits(["saved", "cancel"]);

const saving = ref(false);
const formKey = ref(0);

const emptyForm = () => ({
  name: "",
  isActive: true,
});

const form = reactive(emptyForm());
const initialValues = reactive(emptyForm());

const isEdit = computed(() => Boolean(props.teacher?.id));

const resolvedAcademicYearId = computed(() => {
  if (props.teacher?.academicYearId || props.teacher?.academicYear?.id) {
    return String(
      props.teacher.academicYearId || props.teacher.academicYear.id,
    );
  }
  if (props.lockedAcademicYearId) return String(props.lockedAcademicYearId);
  if (currentAcademicYearId.value) return String(currentAcademicYearId.value);
  return null;
});

const applyTeacher = (teacher) => {
  const next = {
    name: teacher?.name || "",
    isActive: teacher ? teacher.status !== "INACTIVE" : true,
  };

  Object.assign(form, next);
  Object.assign(initialValues, { ...next });
  formKey.value += 1;
};

watch(
  () => props.teacher,
  (teacher) => {
    applyTeacher(teacher);
  },
  { immediate: true },
);

const submit = async () => {
  saving.value = true;

  try {
    const name = form.name.trim();
    if (!name) throw new Error("اسم المدرس مطلوب.");

    let result;

    if (isEdit.value) {
      result = await teacherService.updateTeacher(props.teacher.id, { name });

      const nextStatus = form.isActive ? "ACTIVE" : "INACTIVE";
      if (props.teacher.status !== nextStatus) {
        result = await teacherService.updateTeacherStatus(props.teacher.id, {
          status: nextStatus,
        });
      }
    } else {
      const academicYearId = resolvedAcademicYearId.value;
      if (!academicYearId) {
        throw new Error("اختر العام الدراسي أولاً.");
      }
      result = await teacherService.createTeacher({
        name,
        academicYearId,
      });
    }

    emit("saved", result);
  } catch (error) {
    showError(error?.message || "تعذر حفظ المدرس.");
  } finally {
    saving.value = false;
  }
};
</script>
