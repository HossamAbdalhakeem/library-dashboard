<template>
  <Dialog
    :visible="visible"
    modal
    :header="header"
    dir="rtl"
    :dismissable-mask="true"
    :style="{ width: 'calc(42rem + 200px)', maxWidth: '95vw' }"
    :pt="{
      content: { class: 'max-h-[75vh] overflow-y-auto' },
    }"
    @update:visible="$emit('update:visible', $event)"
  >
    <OperationTimelinePanel
      :timeline="timeline"
      :loading="loading"
      :error="error"
      :show-title="false"
      @retry="$emit('retry')"
    />
  </Dialog>
</template>

<script setup>
import Dialog from "primevue/dialog";
import OperationTimelinePanel from "~/components/dashboard/pages/reports/daily/DailyReportStudentOperationsSection/partials/OperationTimelinePanel.vue";

defineOptions({ name: "OperationTimelineDialog" });

defineProps({
  visible: { type: Boolean, default: false },
  header: { type: String, default: "سجل العملية" },
  timeline: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
});

defineEmits(["update:visible", "retry"]);
</script>
