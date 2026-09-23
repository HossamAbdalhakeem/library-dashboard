<template>
  <Field v-slot="{ field, errorMessage }" name="fullName" rules="required">
    <div class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium text-slate-700">الاسم الكامل</label>
      <InputText
        v-bind="field"
        :model-value="fullName"
        class="w-full"
        :class="{ 'p-invalid': errorMessage || fieldErrors?.fullName }"
        @update:model-value="$emit('update:fullName', $event)"
      />
      <ErrorMessage name="fullName" class="text-xs text-red-500" />
    </div>
  </Field>
</template>

<script setup>
import InputText from "primevue/inputtext";
import { Field, ErrorMessage } from "vee-validate";

defineOptions({ name: "UserFullNameField" });

defineProps({
  fullName: { type: String, default: "" },
  fieldErrors: { type: Object, default: () => ({}) },
});

defineEmits(["update:fullName"]);
</script>
