<template>
  <section
    class="space-y-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-elevated)] p-4"
  >
    <p class="text-sm font-semibold text-[var(--app-text-strong)]">{{ title }}</p>

    <p v-if="!punch" class="text-sm text-[var(--app-muted)]">لم يتم التسجيل</p>

    <template v-else>
      <div class="flex items-center justify-between gap-3 text-sm">
        <span class="text-[var(--app-muted)]">الوقت</span>
        <span class="font-medium text-[var(--app-text-strong)]">{{ timeLabel }}</span>
      </div>
      <div
        v-if="punch.branch?.name"
        class="flex items-center justify-between gap-3 text-sm"
      >
        <span class="text-[var(--app-muted)]">الفرع</span>
        <span class="font-medium text-[var(--app-text-strong)]">{{ punch.branch.name }}</span>
      </div>
      <div class="flex items-center justify-between gap-3 text-sm">
        <span class="text-[var(--app-muted)]">حالة الموقع</span>
        <span class="font-medium text-[var(--app-text-strong)]">{{ locationLabel }}</span>
      </div>
      <div class="flex items-center justify-between gap-3 text-sm">
        <span class="text-[var(--app-muted)]">الدقة</span>
        <span class="font-medium text-[var(--app-text-strong)]">{{ accuracyLabel }}</span>
      </div>
      <div class="flex items-center justify-between gap-3 text-sm">
        <span class="text-[var(--app-muted)]">الموقع</span>
        <span class="font-medium text-[var(--app-text-strong)]" dir="ltr">{{ coordinatesLabel }}</span>
      </div>
      <div class="flex items-center justify-between gap-3 text-sm">
        <span class="text-[var(--app-muted)]">الصورة</span>
        <AttendancePhotoButton :attendance-id="punch.id" :title="title" />
      </div>
    </template>
  </section>
</template>

<script setup>
import {
  attendanceLocationLabel,
  formatAccuracyMeters,
  formatAttendanceTime,
  formatCoordinates,
} from "~/services/attendance";
import AttendancePhotoButton from "~/components/dashboard/pages/attendance/components/AttendancePhotoButton.vue";

defineOptions({ name: "AttendancePunchDetail" });

const props = defineProps({
  title: { type: String, required: true },
  punch: { type: Object, default: null },
});

const timeLabel = computed(() => formatAttendanceTime(props.punch?.occurredAt));
const locationLabel = computed(() => attendanceLocationLabel(props.punch?.location));
const accuracyLabel = computed(() => formatAccuracyMeters(props.punch?.location?.accuracy));
const coordinatesLabel = computed(() => formatCoordinates(props.punch?.location));
</script>
