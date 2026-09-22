<template>
  <div class="ops-timeline-panel w-full space-y-3 text-right" dir="rtl">
    <p class="text-sm font-semibold text-white">سجل العملية</p>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="`tl-skel-${i}`" class="flex gap-3">
        <Skeleton height="2.5rem" width="30%" />
        <Skeleton shape="circle" size="2.75rem" class="mt-0.5 shrink-0" />
        <div class="min-w-0 flex-1 space-y-2">
          <Skeleton height="4.5rem" width="100%" border-radius="0.75rem" />
        </div>
      </div>
    </div>

    <div
      v-else-if="error"
      class="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300"
    >
      <p>{{ error }}</p>
      <Button
        class="mt-2"
        label="إعادة المحاولة"
        text
        size="small"
        @click="$emit('retry')"
      />
    </div>

    <p v-else-if="!timeline.length" class="text-sm text-slate-400">
      لا توجد أحداث إضافية لهذه العملية.
    </p>

    <Timeline
      v-else
      :value="timeline"
      align="right"
      class="ops-timeline w-[82%] @container"
      :pt="{
        eventOpposite: { class: '@max-[280px]:hidden' },
        eventContent: { class: '@max-[280px]:text-right!' },
        eventConnector: { class: 'mb-4' },
      }"
    >
      <template #opposite="{ item }">
        <div class="pt-1 text-left" dir="ltr">
          <AppDateTimeCell :value="item.date" />
        </div>
      </template>

      <template #marker="{ item }">
        <span
          class="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg"
          :style="{ backgroundColor: markerMeta(item).color }"
        >
          <i :class="[markerMeta(item).icon, 'text-base']" />
        </span>
      </template>

      <template #content="{ item }">
        <div
          class="mb-4 rounded-xl border border-slate-700 bg-slate-900/80 p-4 text-right shadow-sm"
          dir="rtl"
        >
          <div class="mb-2 hidden text-sm text-slate-400 @max-[280px]:block">
            <AppDateTimeCell :value="item.date" />
          </div>

          <p class="mb-3 font-bold text-white">{{ item.title }}</p>

          <ul
            v-if="item.details?.length"
            class="mt-1 space-y-1.5"
          >
            <li
              v-for="(line, idx) in item.details"
              :key="`${item.id}-d-${idx}`"
              class="flex items-start gap-2 break-words text-sm leading-relaxed text-slate-300"
            >
              <i class="pi pi-box mt-0.5 shrink-0 text-xs text-slate-500" />
              <span>{{ line }}</span>
            </li>
          </ul>

          <div
            v-if="item.image?.hasProof || item.paymentId"
            class="mt-3"
          >
            <PaymentProofThumb
              :method="item.method"
              :method-label="item.methodLabel"
              :payment-id="item.paymentId"
              :proof-url="item.image?.url"
              :has-proof="item.image?.hasProof"
            />
          </div>

          <p
            v-if="item.actorName"
            class="mt-3 text-xs text-slate-500"
          >
            بواسطة: {{ item.actorName }}
          </p>
        </div>
      </template>
    </Timeline>
  </div>
</template>

<script setup>
import Timeline from "primevue/timeline";
import Skeleton from "primevue/skeleton";
import Button from "primevue/button";
import AppDateTimeCell from "~/components/shared/app-datetime-cell/index.vue";
import PaymentProofThumb from "~/components/shared/payment-proof-thumb/index.vue";

defineOptions({ name: "OperationTimelinePanel" });

defineProps({
  timeline: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
});

defineEmits(["retry"]);

const EVENT_MARKERS = {
  CREATED: { icon: "pi pi-plus", color: "#0ea5e9" },
  PAYMENT: { icon: "pi pi-wallet", color: "#10b981" },
  DELIVERED: { icon: "pi pi-check", color: "#34d399" },
  CANCELLED: { icon: "pi pi-times", color: "#fb7185" },
  REFUND: { icon: "pi pi-replay", color: "#f43f5e" },
  EXCHANGE: { icon: "pi pi-sync", color: "#8b5cf6" },
  RETURN: { icon: "pi pi-undo", color: "#e11d48" },
  COMPLETED: { icon: "pi pi-check", color: "#22c55e" },
};

const DEFAULT_MARKER = { icon: "pi pi-circle", color: "#64748b" };

const markerMeta = (item) =>
  EVENT_MARKERS[String(item?.type || "").toUpperCase()] || DEFAULT_MARKER;
</script>

<style scoped>
.ops-timeline {
  width: 82%;
  max-width: 82%;
}

.ops-timeline :deep(.p-timeline-event-connector) {
  background: rgba(148, 163, 184, 0.35);
}

.ops-timeline :deep(.p-timeline-event-opposite),
.ops-timeline :deep(.p-timeline-event-content) {
  min-width: 0;
}
</style>
