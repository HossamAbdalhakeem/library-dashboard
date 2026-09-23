<template>
  <Form
    v-slot="{ errors: fieldErrors, meta }"
    :key="formKey"
    :initial-values="initialValues"
    class="grid gap-4"
    @submit="submit"
  >
    <UserFullNameField
      v-model:full-name="form.fullName"
      :field-errors="fieldErrors"
    />

    <UserEmailField
      v-model:email="form.email"
      :field-errors="fieldErrors"
    />

    <UserPasswordField
      v-model:password="form.password"
      :is-edit="isEdit"
      :field-errors="fieldErrors"
    />

    <UserPhoneField v-model:phone="form.phone" />

    <UserRoleField
      v-model:role="form.role"
      :role-options="roleOptions"
      :field-errors="fieldErrors"
    />

    <UserBranchField
      v-if="needsBranch"
      v-model:branch-id="form.branchId"
      :field-errors="fieldErrors"
    />

    <UserActiveToggle
      v-if="isEdit"
      v-model:is-active="form.isActive"
    />

    <UserFormActions
      :is-edit="isEdit"
      :loading="saving"
      :valid="meta.valid"
      @cancel="$emit('cancel')"
    />
  </Form>
</template>

<script setup>
import { Form } from "vee-validate";
import UserFullNameField from "./partials/UserFullNameField.vue";
import UserEmailField from "./partials/UserEmailField.vue";
import UserPasswordField from "./partials/UserPasswordField.vue";
import UserPhoneField from "./partials/UserPhoneField.vue";
import UserRoleField from "./partials/UserRoleField.vue";
import UserBranchField from "./partials/UserBranchField.vue";
import UserActiveToggle from "./partials/UserActiveToggle.vue";
import UserFormActions from "./partials/UserFormActions.vue";
import {
  userApi,
  emptyUserForm,
  mapUserToForm,
  buildUserPayload,
} from "~/services/user";
import { useAppToast } from "~/composables/useAppToast";
import {
  USER_ROLE_OPTIONS,
  isAdminRole,
  normalizeUserRole,
  userRoleRequiresBranch,
  UserRole,
} from "~/enums/userRole";

defineOptions({ name: "UserForm" });

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

const form = reactive(emptyUserForm());
const initialValues = reactive(emptyUserForm());

const needsBranch = computed(() => userRoleRequiresBranch(form.role));

const resolveRole = (value) => {
  const role = normalizeUserRole(value, DEFAULT_CREATE_ROLE);
  return isAdminRole(role) ? DEFAULT_CREATE_ROLE : role;
};

watch(
  () => props.user,
  (value) => {
    const next = mapUserToForm(value);
    next.role = resolveRole(next.role);
    Object.assign(form, next);
    Object.assign(initialValues, next);
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
    const payload = buildUserPayload({
      ...form,
      branchId: needsBranch.value ? form.branchId : null,
    });

    let result;
    if (isEdit.value) {
      result = await userApi.updateUser(props.user.id, payload);

      const nextStatus = form.isActive ? "ACTIVE" : "INACTIVE";
      if (props.user.status !== nextStatus) {
        result = await userApi.updateUserStatus(props.user.id, {
          status: nextStatus,
        });
      }
    } else {
      result = await userApi.createUser(payload);
    }
    emit("saved", result);
  } catch (error) {
    showError(error?.message || "تعذر حفظ المستخدم.");
  } finally {
    saving.value = false;
  }
};
</script>
