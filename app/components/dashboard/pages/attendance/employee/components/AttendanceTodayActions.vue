<template>
  <footer class="border-t border-[var(--app-border)] px-5 py-4">
    <p v-if="completed" class="att-done">
      <i class="pi pi-check-circle" />
      تم إكمال حضور اليوم
    </p>
    <Button
      v-else-if="!hasCheckIn"
      label="تسجيل الحضور"
      icon="pi pi-sign-in"
      class="w-full"
      size="large"
      :loading="submitting"
      @click="$emit('check-in')"
    />
    <Button
      v-else
      label="تسجيل الانصراف"
      icon="pi pi-sign-out"
      class="w-full"
      size="large"
      severity="secondary"
      :loading="submitting"
      @click="$emit('check-out')"
    />
  </footer>
</template>

<script setup>
import Button from "primevue/button";

defineOptions({ name: "AttendanceTodayActions" });

defineProps({
  completed: { type: Boolean, default: false },
  hasCheckIn: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
});

defineEmits(["check-in", "check-out"]);
</script>

<style scoped>
.att-done {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border-radius: 0.9rem;
  padding: 0.8rem 1rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #047857;
  background: color-mix(in srgb, #10b981 12%, transparent);
}

:global(.app-dark) .att-done {
  color: #6ee7b7;
}
</style>
