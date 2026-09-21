<template>
  <Dialog
    :visible="visible"
    modal
    dir="rtl"
    :closable="false"
    :dismissableMask="false"
    :closeOnEscape="false"
    :style="{ width: '440px', maxWidth: '95vw' }"
    :pt="{
      header: { class: 'hidden' },
      content: { class: 'pt-6' },
    }"
    @update:visible="emit('update:visible', $event)"
  >
    <SaleSuccessDialogContent
      v-if="visible"
      :sale-summary="saleSummary"
    />

    <template #footer>
      <div class="flex w-full justify-center">
        <Button
          label="إغلاق"
          severity="secondary"
          class="min-w-[120px]"
          @click="emit('close')"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";

const SaleSuccessDialogContent = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/sales/manage/SaleSuccessDialogContent.vue"),
);

defineProps({
  visible: { type: Boolean, default: false },
  saleSummary: { type: Object, default: null },
});

const emit = defineEmits(["update:visible", "close"]);
</script>
