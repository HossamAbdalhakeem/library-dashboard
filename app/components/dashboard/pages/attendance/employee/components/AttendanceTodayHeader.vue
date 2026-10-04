<template>
  <header class="border-b border-[var(--app-border)] px-5 py-5">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 text-right">
        <p class="text-xs font-medium text-[var(--app-muted)]">حضور اليوم</p>
        <h2 class="mt-1 text-xl font-bold text-[var(--app-text-strong)]">
          الحضور والانصراف
        </h2>
        <p class="mt-1 text-sm text-[var(--app-text)]">{{ dateLabel }}</p>
      </div>
      <span class="att-pill" :class="`att-pill--${shiftStatus.key}`">
        {{ shiftStatus.label }}
      </span>
    </div>

    <div class="mt-5 flex flex-wrap items-end justify-between gap-3">
      <p
        class="text-4xl font-semibold tabular-nums tracking-tight text-[var(--app-text-strong)]"
      >
        {{ clockLabel }}
      </p>
      <span class="att-location" :class="`att-location--${locationTone}`">
        <i :class="locationIcon" class="text-xs" />
        {{ locationLabel }}
      </span>
    </div>
    <p class="mt-2 text-sm text-[var(--app-muted)]">{{ shiftStatus.hint }}</p>
  </header>
</template>

<script setup>
defineOptions({ name: "AttendanceTodayHeader" });

defineProps({
  dateLabel: { type: String, default: "" },
  clockLabel: { type: String, default: "" },
  shiftStatus: { type: Object, required: true },
  locationLabel: { type: String, default: "" },
  locationTone: { type: String, default: "idle" },
  locationIcon: { type: String, default: "pi pi-map-marker" },
});
</script>

<style scoped>
.att-pill {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  border-radius: 9999px;
  border: 1px solid transparent;
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.25rem;
}

.att-pill--waiting {
  color: #b45309;
  background: color-mix(in srgb, var(--app-primary) 16%, transparent);
  border-color: color-mix(in srgb, var(--app-primary) 42%, transparent);
}

.att-pill--in,
.att-pill--done {
  color: #047857;
  background: color-mix(in srgb, #10b981 14%, transparent);
  border-color: color-mix(in srgb, #10b981 36%, transparent);
}

:global(.app-dark) .att-pill--waiting {
  color: #fde68a;
}

:global(.app-dark) .att-pill--in,
:global(.app-dark) .att-pill--done {
  color: #6ee7b7;
}

.att-location {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 9999px;
  border: 1px solid var(--app-border);
  background: var(--app-elevated);
  padding: 0.3rem 0.7rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--app-text);
}

.att-location--ok {
  color: #047857;
  border-color: color-mix(in srgb, #10b981 40%, var(--app-border));
}

.att-location--warn {
  color: #be123c;
  border-color: color-mix(in srgb, #f43f5e 40%, var(--app-border));
}

:global(.app-dark) .att-location--ok {
  color: #6ee7b7;
}

:global(.app-dark) .att-location--warn {
  color: #fda4af;
}
</style>
