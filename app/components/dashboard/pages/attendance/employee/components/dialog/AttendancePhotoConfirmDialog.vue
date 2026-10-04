<template>
  <Dialog
    :visible="Boolean(previewUrl)"
    modal
    dir="rtl"
    header="تأكيد الصورة"
    :style="{ width: '320px', maxWidth: '92vw' }"
    :closable="!submitting"
    :close-on-escape="!submitting"
    :dismissable-mask="false"
    :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
    @update:visible="$emit('update:visible', $event)"
  >
    <p class="mb-3 flex items-center gap-1.5 text-sm text-[var(--app-text)]">
      <i :class="locationIcon" class="text-xs" />
      {{ locationLabel }}
    </p>
    <img
      v-if="previewUrl"
      :src="previewUrl"
      alt="صورة الحضور"
      class="aspect-video max-h-48 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-elevated)] object-contain"
    >
    <div class="mt-4 flex flex-wrap justify-end gap-2">
      <Button
        type="button"
        label="إعادة الالتقاط"
        severity="secondary"
        text
        :disabled="submitting"
        @click="$emit('retake')"
      />
      <Button
        type="button"
        label="تأكيد"
        :loading="submitting"
        @click="$emit('confirm')"
      />
    </div>
  </Dialog>
</template>

<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";

defineOptions({ name: "AttendancePhotoConfirmDialog" });

defineProps({
  previewUrl: { type: String, default: "" },
  submitting: { type: Boolean, default: false },
  locationIcon: { type: String, default: "pi pi-map-marker" },
  locationLabel: { type: String, default: "" },
});

defineEmits(["update:visible", "retake", "confirm"]);
</script>
