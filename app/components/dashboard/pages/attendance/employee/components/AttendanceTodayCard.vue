<template>
  <section
    class="overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] shadow-sm"
  >
    <AttendanceTodaySkeleton v-if="loading" />

    <template v-else>
      <AttendanceTodayHeader
        :date-label="dateLabel"
        :clock-label="clockLabel"
        :shift-status="shiftStatus"
        :location-label="locationLabel"
        :location-tone="locationTone"
        :location-icon="locationIcon"
      />

      <div class="space-y-3 px-5 py-5">
        <AttendancePunchStep
          title="الحضور"
          :hint="today.checkIn ? checkInTime : 'لم يتم التسجيل'"
          :icon="today.checkIn ? 'pi pi-check' : 'pi pi-sign-in'"
          :state-class="checkInStateClass"
          :attendance-id="today.checkIn?.id"
          photo-title="صورة الحضور"
        />
        <AttendancePunchStep
          title="الانصراف"
          :hint="checkOutHint"
          :icon="today.checkOut ? 'pi pi-check' : 'pi pi-sign-out'"
          :state-class="checkOutStateClass"
          :attendance-id="today.checkOut?.id"
          photo-title="صورة الانصراف"
        />
      </div>

      <AttendanceTodayActions
        :completed="completed"
        :has-check-in="Boolean(today.checkIn)"
        :submitting="submitting"
        @check-in="$emit('check-in')"
        @check-out="$emit('check-out')"
      />
    </template>
  </section>
</template>

<script setup>
import AttendanceTodaySkeleton from "./AttendanceTodaySkeleton.vue";
import AttendanceTodayHeader from "./AttendanceTodayHeader.vue";
import AttendancePunchStep from "./AttendancePunchStep.vue";
import AttendanceTodayActions from "./AttendanceTodayActions.vue";

defineOptions({ name: "AttendanceTodayCard" });

defineProps({
  loading: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
  today: { type: Object, required: true },
  dateLabel: { type: String, default: "" },
  clockLabel: { type: String, default: "" },
  shiftStatus: { type: Object, required: true },
  locationLabel: { type: String, default: "" },
  locationTone: { type: String, default: "idle" },
  locationIcon: { type: String, default: "pi pi-map-marker" },
  checkInTime: { type: String, default: "" },
  checkOutHint: { type: String, default: "" },
  checkInStateClass: { type: String, default: "" },
  checkOutStateClass: { type: String, default: "" },
  completed: { type: Boolean, default: false },
});

defineEmits(["check-in", "check-out"]);
</script>
