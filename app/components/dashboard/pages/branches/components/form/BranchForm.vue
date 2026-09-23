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
          <label class="text-sm font-medium text-slate-700">اسم الفرع</label>
          <InputText
            v-bind="field"
            v-model="form.name"
            class="w-full"
            placeholder="مثال: الفرع الرئيسي"
            :class="{ 'p-invalid': errorMessage || fieldErrors.name }"
          />
          <ErrorMessage name="name" class="text-xs text-red-500" />
        </div>
      </Field>

      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">العنوان</label>
        <InputText v-model="form.address" class="w-full" placeholder="اختياري" />
      </div>

      <AppPhoneInput
        v-model="form.phone"
        label="الهاتف"
        placeholder="اختياري"
      />

      <div
        v-if="isEdit"
        class="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3"
      >
        <div class="text-right">
          <p class="text-sm font-medium text-slate-800">حالة الفرع</p>
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
          :label="isEdit ? 'تحديث الفرع' : 'حفظ الفرع'"
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
import AppPhoneInput from "~/components/shared/inputs/app-phone-input/index.vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import {
  branchApi,
  emptyBranchForm,
  mapBranchToForm,
  buildBranchPayload,
} from "~/services/branch";
import { useAppToast } from "~/composables/useAppToast";

const { showError } = useAppToast();

const props = defineProps({
  branch: { type: Object, default: null },
});

const emit = defineEmits(["saved", "cancel"]);

const saving = ref(false);
const formKey = ref(0);

const form = reactive(emptyBranchForm());
const initialValues = reactive(emptyBranchForm());

const isEdit = computed(() => Boolean(props.branch?.id));

watch(
  () => props.branch,
  (branch) => {
    const next = mapBranchToForm(branch);
    Object.assign(form, next);
    Object.assign(initialValues, next);
    formKey.value += 1;
  },
  { immediate: true },
);

const submit = async () => {
  saving.value = true;
  try {
    const payload = buildBranchPayload(form);
    if (!payload.name) throw new Error("اسم الفرع مطلوب.");

    let result;
    if (isEdit.value) {
      result = await branchApi.updateBranch(props.branch.id, payload);
      const nextStatus = form.isActive ? "ACTIVE" : "INACTIVE";
      if (props.branch.status !== nextStatus) {
        result = await branchApi.updateBranchStatus(props.branch.id, {
          status: nextStatus,
        });
      }
    } else {
      result = await branchApi.createBranch(payload);
    }

    emit("saved", result);
  } catch (error) {
    showError(error?.message || "تعذر حفظ الفرع.");
  } finally {
    saving.value = false;
  }
};
</script>
