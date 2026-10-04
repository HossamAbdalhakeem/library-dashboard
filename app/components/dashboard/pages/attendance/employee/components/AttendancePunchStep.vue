<template>
  <article class="att-step" :class="stateClass">
    <span class="att-step__mark" aria-hidden="true">
      <i :class="icon" />
    </span>
    <div class="min-w-0 flex-1">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0 text-right">
          <p class="text-sm font-semibold text-[var(--app-text-strong)]">
            {{ title }}
          </p>
          <p class="mt-0.5 text-sm text-[var(--app-text)]">{{ hint }}</p>
        </div>
        <AttendancePhotoButton
          v-if="attendanceId"
          :attendance-id="attendanceId"
          :title="photoTitle"
        />
      </div>
    </div>
  </article>
</template>

<script setup>
import AttendancePhotoButton from "~/components/dashboard/pages/attendance/components/AttendancePhotoButton.vue";

defineOptions({ name: "AttendancePunchStep" });

defineProps({
  title: { type: String, required: true },
  hint: { type: String, default: "" },
  icon: { type: String, required: true },
  stateClass: { type: String, default: "" },
  attendanceId: { type: [String, Number], default: null },
  photoTitle: { type: String, default: "" },
});
</script>

<style scoped>
.att-step {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  border-radius: 1rem;
  border: 1px solid var(--app-border);
  background: var(--app-elevated);
  padding: 0.9rem 1rem;
}

.att-step--active {
  border-color: color-mix(in srgb, var(--app-primary) 55%, var(--app-border));
  background: color-mix(in srgb, var(--app-primary) 10%, var(--app-elevated));
}

.att-step--done {
  border-color: color-mix(in srgb, #10b981 42%, var(--app-border));
}

.att-step--locked {
  opacity: 0.62;
}

.att-step__mark {
  display: inline-flex;
  height: 2.5rem;
  width: 2.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid var(--app-border);
  background: var(--app-card);
  color: var(--app-muted);
}

.att-step--active .att-step__mark {
  border-color: transparent;
  background: var(--app-primary);
  color: var(--app-primary-contrast);
}

.att-step--done .att-step__mark {
  border-color: transparent;
  background: #10b981;
  color: #ffffff;
}
</style>
