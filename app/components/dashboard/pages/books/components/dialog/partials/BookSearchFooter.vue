<template>
  <div class="flex w-full justify-end">
    <Button
      label="إغلاق"
      text
      severity="secondary"
      @click="$emit('close')"
    />
  </div>
</template>

<script setup>
import Button from "primevue/button";

defineOptions({ name: "BookSearchFooter" });

defineEmits(["close"]);
</script>
