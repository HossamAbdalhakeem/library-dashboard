<template>
  <div
    class="!w-[70%] rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-right"
  >
    <OperationTimelinePanel
      :timeline="events"
      :loading="loading"
      :error="error"
      @retry="$emit('retry')"
    />
  </div>
</template>

<script setup>
import OperationTimelinePanel from "~/components/dashboard/pages/reports/daily/DailyReportStudentOperationsSection/partials/OperationTimelinePanel.vue";

defineOptions({ name: "SalesExchangeTimelineExpansion" });

defineProps({
  events: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
});

defineEmits(["retry"]);
</script>
