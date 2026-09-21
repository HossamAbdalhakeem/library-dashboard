<template>
  <Form
    v-slot="{ errors: fieldErrors, meta }"
    :key="formKey"
    :initial-values="initialValues"
    class="grid gap-4"
    @submit="submit"
  >
    <Field v-slot="{ field, errorMessage }" name="fullName" rules="required">
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">الاسم الكامل</label>
        <InputText
          v-bind="field"
          v-model="form.fullName"
          class="w-full"
          :class="{ 'p-invalid': errorMessage || fieldErrors.fullName }"
        />
        <ErrorMessage name="fullName" class="text-xs text-red-500" />
      </div>
    </Field>

    <Field v-slot="{ field, errorMessage }" name="email" rules="required|email">
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">البريد الإلكتروني</label>
        <InputText
          v-bind="field"
          v-model="form.email"
          type="email"
          class="w-full"
          :class="{ 'p-invalid': errorMessage || fieldErrors.email }"
        />
        <ErrorMessage name="email" class="text-xs text-red-500" />
      </div>
    </Field>

    <Field
      v-slot="{ field, errorMessage }"
      name="password"
      :rules="isEdit ? 'min:6' : 'required|min:6'"
    >
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">
          كلمة المرور
          <span v-if="isEdit" class="text-xs text-slate-400">(اختياري عند التعديل)</span>
        </label>
        <Password
          v-bind="field"
          v-model="form.password"
          toggle-mask
          :feedback="false"
          class="w-full"
          input-class="w-full"
          :class="{ 'p-invalid': errorMessage || fieldErrors.password }"
        />
        <ErrorMessage name="password" class="text-xs text-red-500" />
      </div>
    </Field>

    <Field v-slot="{ field }" name="phone">
      <PhoneInput
        v-model="form.phone"
        label="الهاتف"
        placeholder="رقم الهاتف"
        @update:model-value="field.onChange"
        @blur="field.onBlur"
      />
    </Field>

    <Field v-slot="{ field, errorMessage }" name="role" rules="required">
      <AppGlobalSelectUserRole
        :model-value="form.role"
        :options="roleOptions"
        label="الدور"
        placeholder="اختر الدور"
        :invalid="!!(errorMessage || fieldErrors.role)"
        @update:model-value="
          (value) => {
            form.role = value;
            field.onChange(value);
          }
        "
      />
      <ErrorMessage name="role" class="text-xs text-red-500" />
    </Field>

    <Field
      v-if="needsBranch"
      v-slot="{ errorMessage }"
      v-model="form.branchId"
      name="branchId"
      rules="required"
    >
      <div class="flex flex-col gap-2 text-right">
        <AppGlobalSelectBranch
          v-model="form.branchId"
          label="الفرع"
          placeholder="اختر الفرع"
          :invalid="!!(errorMessage || fieldErrors.branchId)"
        />
        <ErrorMessage name="branchId" class="text-xs text-red-500" />
      </div>
    </Field>

    <Field v-if="isEdit" v-slot="{ field }" name="status">
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">الحالة</label>
        <Select
          v-bind="field"
          v-model="form.status"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          class="w-full"
        />
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
import AppGlobalSelectUserRole from "~/components/shared/app-global-select-user-role/index.vue";
import AppGlobalSelectBranch from "~/components/shared/app-global-select-branch/index.vue";
import PhoneInput from "~/components/shared/phone-input/index.vue";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Select from "primevue/select";
import { Form, Field, ErrorMessage } from "vee-validate";
import { userService } from "~/services/userService";
import { useAppToast } from "~/composables/useAppToast";
import {
  UserRole,
  USER_ROLE_OPTIONS,
  isAdminRole,
  normalizeUserRole,
  userRoleRequiresBranch,
} from "~/enums/userRole";

const { showError } = useAppToast();

const props = defineProps({
  user: { type: Object, default: null },
});

const emit = defineEmits(["saved", "cancel"]);

const saving = ref(false);
const formKey = ref(0);
const isEdit = computed(() => Boolean(props.user?.id));

const DEFAULT_CREATE_ROLE = UserRole.BRANCH_EMPLOYEE;

const roleOptions = computed(() =>
  USER_ROLE_OPTIONS.filter((option) => !isAdminRole(option.value)),
);

const statusOptions = [
  { label: "نشط", value: "ACTIVE" },
  { label: "غير نشط", value: "INACTIVE" },
];

const form = reactive({
  fullName: "",
  email: "",
  password: "",
  phone: "",
  role: DEFAULT_CREATE_ROLE,
  branchId: null,
  status: "ACTIVE",
});

const needsBranch = computed(() => userRoleRequiresBranch(form.role));

const resolveRole = (value) => {
  const role = normalizeUserRole(value, DEFAULT_CREATE_ROLE);
  return isAdminRole(role) ? DEFAULT_CREATE_ROLE : role;
};

const initialValues = computed(() => ({
  fullName: props.user?.fullName || "",
  email: props.user?.email || "",
  password: "",
  phone: props.user?.phone || "",
  role: resolveRole(props.user?.role),
  branchId: props.user?.branchId || null,
  status: props.user?.status || "ACTIVE",
}));

watch(
  () => props.user,
  (value) => {
    form.fullName = value?.fullName || "";
    form.email = value?.email || "";
    form.password = "";
    form.phone = value?.phone || "";
    form.role = resolveRole(value?.role);
    form.branchId = value?.branchId || null;
    form.status = value?.status || "ACTIVE";
    formKey.value += 1;
  },
  { immediate: true },
);

watch(
  () => form.role,
  (role) => {
    if (!userRoleRequiresBranch(role)) form.branchId = null;
  },
);

const submit = async () => {
  saving.value = true;
  try {
    const payload = {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone || undefined,
      role: form.role,
      branchId: needsBranch.value ? form.branchId : undefined,
    };
    if (form.password) payload.password = form.password;

    let result;
    if (isEdit.value) {
      result = await userService.updateUser(props.user.id, payload);
      if (form.status && form.status !== props.user.status) {
        result = await userService.updateUserStatus(props.user.id, form.status);
      }
    } else {
      result = await userService.createUser(payload);
    }
    emit("saved", result);
  } catch (error) {
    showError(error?.message || "تعذر حفظ المستخدم.");
  } finally {
    saving.value = false;
  }
};
</script>
