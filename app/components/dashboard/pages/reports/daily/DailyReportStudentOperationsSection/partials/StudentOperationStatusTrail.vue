<template>
  <div
    v-if="steps.length > 1"
    class="ops-trail"
    :style="trackStyle"
    role="group"
    :aria-label="trailLabel"
  >
    <template v-for="(step, index) in steps" :key="index">
      <span
        v-if="index > 0"
        class="ops-trail-link"
        :style="{ '--link-color': step.color }"
        aria-hidden="true"
      >
        <span class="ops-trail-line" />
        <i class="pi pi-angle-left" />
      </span>

      <span class="ops-trail-step">
        <span
          v-if="index < steps.length - 1"
          class="ops-trail-past"
          :style="{ '--step-color': step.color }"
        >
          <span class="ops-trail-dot" />
          <span class="ops-trail-past-label">{{ step.label }}</span>
        </span>
        <span v-else class="ops-tag" :style="metricTagStyle(step.color)">
          {{ step.label }}
        </span>
        <span v-if="step.atLabel" class="ops-trail-at">{{ step.atLabel }}</span>
      </span>
    </template>
  </div>
  <span
    v-else
    class="ops-tag"
    :style="metricTagStyle(steps[0]?.color || fallbackColor)"
  >
    {{ steps[0]?.label || fallbackLabel }}
  </span>
</template>

<script setup>
import { formatDateTimeParts } from "~/utils/format/datetime";
import {
  getStudentOpsTrailColor,
  getStudentOpsTrailLabel,
} from "~/utils/domain-labels/student-operations";
import { metricTagStyle } from "~/utils/studentOperationsReport";

defineOptions({ name: "StudentOperationStatusTrail" });

const props = defineProps({
  /** Raw `statusTrail` from the student-operations row. */
  trail: { type: Array, default: () => [] },
  /** End-of-day status code, used when `trail` is empty. */
  fallbackStatus: { type: String, default: "" },
  fallbackLabel: { type: String, default: "—" },
  fallbackColor: { type: String, default: "" },
});

const trailAtParts = (value) => {
  const parts = formatDateTimeParts(value);
  if (parts.empty) return { date: "", time: "" };
  return { date: parts.date, time: parts.time };
};

/** One step stays a single tag. Later steps show `at` under the label. */
const steps = computed(() => {
  const trail = (Array.isArray(props.trail) ? props.trail : [])
    .map((step) => {
      const status = String(step?.status || "").trim().toUpperCase();
      if (!status) return null;
      return { status, at: step?.at || null };
    })
    .filter(Boolean);

  const source = trail.length
    ? trail
    : props.fallbackStatus
      ? [{ status: props.fallbackStatus, at: null }]
      : [];
  const multiple = source.length > 1;

  return source.map((step, index) => {
    const at = multiple && index > 0 ? trailAtParts(step.at) : null;
    const atLabel = [at?.date, at?.time].filter(Boolean).join(" · ");
    return {
      label: getStudentOpsTrailLabel(step.status),
      color: getStudentOpsTrailColor(step.status),
      atLabel,
    };
  });
});

const trailLabel = computed(() => steps.value.map((step) => step.label).join(" ثم "));

const trackStyle = computed(() => {
  const accent = steps.value[steps.value.length - 1]?.color || "var(--app-muted)";
  return { "--trail-accent": accent };
});
</script>

<style scoped>
.ops-tag {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 9999px;
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.25rem;
}

.ops-trail {
  display: inline-flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0.3rem;
  max-width: 100%;
  padding: 0.3rem 0.45rem 0.35rem;
  border-radius: 0.9rem;
  background: color-mix(in srgb, var(--trail-accent) 9%, var(--app-elevated));
  border: 1px solid color-mix(in srgb, var(--trail-accent) 32%, var(--app-border));
}

.ops-trail-step {
  display: inline-flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
}

.ops-trail-past {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  height: 1.5rem;
  color: color-mix(in srgb, var(--step-color) 72%, var(--app-text));
}

.ops-trail-dot {
  width: 0.4rem;
  height: 0.4rem;
  flex: 0 0 auto;
  border-radius: 9999px;
  background: var(--step-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--step-color) 18%, transparent);
}

.ops-trail-past-label {
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.ops-trail-link {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  height: 1.5rem;
  color: var(--link-color);
}

.ops-trail-line {
  width: 0.7rem;
  height: 1.5px;
  border-radius: 9999px;
  background: linear-gradient(
    to left,
    color-mix(in srgb, var(--app-muted) 40%, transparent),
    var(--link-color)
  );
}

.ops-trail-link i {
  margin-inline-start: -0.05rem;
  font-size: 0.6rem;
  line-height: 1;
}

.ops-trail-at {
  margin-top: 0.2rem;
  text-align: center;
  font-size: 0.62rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  color: var(--app-muted);
  font-variant-numeric: tabular-nums;
}
</style>
