<template>
  <Field v-slot="{ field, errorMessage }" name="role" rules="required">
    <AppGlobalSelectUserRole
      :model-value="role"
      :options="roleOptions"
      label="الدور"
      placeholder="اختر الدور"
      :invalid="!!(errorMessage || fieldErrors?.role)"
      @update:model-value="
        (value) => {
          $emit('update:role', value);
          field.onChange(value);
        }
      "
    />
    <ErrorMessage name="role" class="text-xs text-red-500" />
  </Field>
</template>

<script setup>
import AppGlobalSelectUserRole from "~/components/shared/selections/app-global-select-user-role/index.vue";
import { Field, ErrorMessage } from "vee-validate";

defineOptions({ name: "UserRoleField" });

defineProps({
  role: { type: [String, null], default: null },
  roleOptions: { type: Array, default: () => [] },
  fieldErrors: { type: Object, default: () => ({}) },
});

defineEmits(["update:role"]);
</script>
