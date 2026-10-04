<template>
  <Dialog
    :visible="visible"
    modal
    dir="rtl"
    :dismissable-mask="true"
    :style="{ width: 'min(52rem, 96vw)' }"
    :pt="{
      header: { class: 'items-start gap-3' },
      content: { class: 'max-h-[75vh] overflow-y-auto' },
    }"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #header>
      <div class="min-w-0 pe-2 text-right">
        <p class="text-base font-semibold leading-snug text-[var(--app-text-strong)]">
          {{ headerTitle }}
        </p>
        <p
          v-if="headerDetail"
          class="mt-1 break-all text-xs font-medium leading-5 text-[var(--app-muted)]"
        >
          {{ headerDetail }}
        </p>
      </div>
    </template>

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

const props = defineProps({
  visible: { type: Boolean, default: false },
  header: { type: String, default: "سجل العملية" },
  timeline: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
});

const headerParts = computed(() => {
  const raw = String(props.header || "");
  const splitAt = raw.indexOf(" · ");
  if (splitAt === -1) return { title: raw, detail: "" };
  return {
    title: raw.slice(0, splitAt),
    detail: raw.slice(splitAt + 3),
  };
});

const headerTitle = computed(() => headerParts.value.title);
const headerDetail = computed(() => headerParts.value.detail);

defineEmits(["update:visible", "retry"]);
</script>
