<template>
  <div class="flex flex-wrap justify-center gap-1">
    <span title="المعاملات" class="inline-flex">
      <Button
        icon="pi pi-list"
        text
        rounded
        size="small"
        severity="secondary"
        aria-label="المعاملات"
        @click="$emit('transactions', student)"
      />
    </span>
    <span title="تعديل" class="inline-flex">
      <Button
        icon="pi pi-pencil"
        text
        rounded
        size="small"
        severity="primary"
        aria-label="تعديل"
        @click="$emit('edit', student)"
      />
    </span>
    <span title="تعطيل" class="inline-flex">
      <Button
        icon="pi pi-ban"
        text
        rounded
        size="small"
        severity="danger"
        aria-label="تعطيل"
        :disabled="loading"
        @click="confirmVisible = true"
      />
    </span>

    <Dialog
      v-model:visible="confirmVisible"
      modal
      header="تأكيد التعطيل"
      :style="{ width: '28rem' }"
      :dismissableMask="!loading"
      :closable="!loading"
      dir="rtl"
    >
      <p class="text-right text-sm text-slate-600">
        هل أنت متأكد من تعطيل الطالب
        <span class="font-semibold text-slate-900">{{ student?.name || "" }}</span>
        ؟
      </p>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="إلغاء"
            severity="secondary"
            text
            :disabled="loading"
            @click="confirmVisible = false"
          />
          <Button
            label="تعطيل"
            severity="danger"
            :loading="loading"
            @click="confirmDeactivate"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";

defineOptions({ name: "StudentsTableActions" });

const props = defineProps({
  student: { type: Object, required: true },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["edit", "deactivate", "transactions"]);

const confirmVisible = ref(false);

const confirmDeactivate = () => {
  emit("deactivate", props.student);
};

watch(
  () => props.loading,
  (isLoading, wasLoading) => {
    if (wasLoading && !isLoading && confirmVisible.value) {
      confirmVisible.value = false;
    }
  },
);
</script>
