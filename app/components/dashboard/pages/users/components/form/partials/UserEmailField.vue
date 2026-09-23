<template>
  <Field v-slot="{ field, errorMessage }" name="email" rules="required|email">
    <div class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium text-slate-700">البريد الإلكتروني</label>
      <InputText
        v-bind="field"
        :model-value="email"
        type="email"
        class="w-full"
        :class="{ 'p-invalid': errorMessage || fieldErrors?.email }"
        @update:model-value="$emit('update:email', $event)"
      />
      <ErrorMessage name="email" class="text-xs text-red-500" />
    </div>
  </Field>
</template>

<script setup>
import InputText from "primevue/inputtext";
import { Field, ErrorMessage } from "vee-validate";

defineOptions({ name: "UserEmailField" });

defineProps({
  email: { type: String, default: "" },
  fieldErrors: { type: Object, default: () => ({}) },
});

defineEmits(["update:email"]);
</script>
