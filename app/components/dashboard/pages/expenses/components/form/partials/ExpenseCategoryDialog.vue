<template>
  <Dialog
    :visible="visible"
    header="إضافة تصنيف مصروف"
    modal
    :style="{ width: '360px' }"
    dir="rtl"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="flex flex-col gap-3 text-right">
      <label class="text-sm font-medium text-slate-700">اسم التصنيف</label>
      <InputText
        :model-value="name"
        class="w-full"
        @update:model-value="$emit('update:name', $event)"
      />
      <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
    </div>
    <template #footer>
      <Button
        label="إلغاء"
        text
        severity="secondary"
        @click="$emit('update:visible', false)"
      />
      <Button
        label="حفظ"
        severity="primary"
        :loading="loading"
        @click="$emit('save')"
      />
    </template>
  </Dialog>
</template>

<script setup>
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Dialog from "primevue/dialog";

defineOptions({ name: "ExpenseCategoryDialog" });

defineProps({
  visible: { type: Boolean, default: false },
  name: { type: String, default: "" },
  error: { type: String, default: "" },
  loading: { type: Boolean, default: false },
});

defineEmits(["update:visible", "update:name", "save"]);
</script>
