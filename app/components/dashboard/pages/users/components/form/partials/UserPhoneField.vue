<template>
  <Field v-slot="{ field }" name="phone">
    <AppPhoneInput
      :model-value="phone"
      label="الهاتف"
      placeholder="رقم الهاتف"
      @update:model-value="
        (value) => {
          $emit('update:phone', value);
          field.onChange(value);
        }
      "
      @blur="field.onBlur"
    />
  </Field>
</template>

<script setup>
import AppPhoneInput from "~/components/shared/inputs/app-phone-input/index.vue";
import { Field } from "vee-validate";

defineOptions({ name: "UserPhoneField" });

defineProps({
  phone: { type: String, default: "" },
});

defineEmits(["update:phone"]);
</script>
