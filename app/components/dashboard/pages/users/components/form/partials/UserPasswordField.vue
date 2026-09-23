<template>
  <Field
    v-slot="{ field, errorMessage }"
    name="password"
    :rules="isEdit ? 'min:6' : 'required|min:6'"
  >
    <div class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium text-slate-700">
        كلمة المرور
        <span v-if="isEdit" class="text-xs text-slate-400"
          >(اختياري عند التعديل)</span
        >
      </label>
      <Password
        v-bind="field"
        :model-value="password"
        toggle-mask
        :feedback="false"
        class="w-full"
        input-class="w-full"
        :class="{ 'p-invalid': errorMessage || fieldErrors?.password }"
        @update:model-value="$emit('update:password', $event)"
      />
      <ErrorMessage name="password" class="text-xs text-red-500" />
    </div>
  </Field>
</template>

<script setup>
import Password from "primevue/password";
import { Field, ErrorMessage } from "vee-validate";

defineOptions({ name: "UserPasswordField" });

defineProps({
  password: { type: String, default: "" },
  isEdit: { type: Boolean, default: false },
  fieldErrors: { type: Object, default: () => ({}) },
});

defineEmits(["update:password"]);
</script>
