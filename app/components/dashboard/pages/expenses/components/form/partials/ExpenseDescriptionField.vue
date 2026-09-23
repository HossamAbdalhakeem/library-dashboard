<template>
  <Field
    v-slot="{}"
    :model-value="description"
    name="description"
    label="الوصف"
    @update:model-value="$emit('update:description', $event)"
  >
    <div class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium text-slate-700">الوصف</label>
      <Textarea
        :model-value="description"
        rows="3"
        class="w-full"
        @update:model-value="$emit('update:description', $event)"
      />
    </div>
  </Field>
</template>

<script setup>
import Textarea from "primevue/textarea";
import { Field } from "vee-validate";

defineOptions({ name: "ExpenseDescriptionField" });

defineProps({
  description: { type: String, default: "" },
});

defineEmits(["update:description"]);
</script>
