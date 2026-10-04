<template>
  <Dialog
    :visible="visible"
    modal
    header="تأكيد تسجيل الخروج"
    :style="{ width: '28rem', maxWidth: '95vw' }"
    :dismissableMask="true"
    dir="rtl"
    @update:visible="$emit('update:visible', $event)"
  >
    <p class="text-right text-sm text-slate-600">
      هل أنت متأكد من تسجيل الخروج؟ سيتم إنهاء الجلسة وإبطال رمز الدخول
      الحالي.
    </p>
    <template #footer>
      <div class="flex flex-wrap justify-end gap-2">
        <Button
          label="إلغاء"
          severity="secondary"
          text
          :disabled="loggingOut"
          @click="$emit('update:visible', false)"
        />
        <Button
          label="تسجيل الخروج"
          severity="danger"
          :loading="loggingOut"
          @click="$emit('confirm')"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import Dialog from "primevue/dialog";
import Button from "primevue/button";

defineProps({
  visible: { type: Boolean, default: false },
  loggingOut: { type: Boolean, default: false },
});

defineEmits(["update:visible", "confirm"]);
</script>
