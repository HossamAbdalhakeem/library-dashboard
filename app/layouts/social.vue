<template>
  <RoleDashboardShell
    role="social"
    title="لوحة التواصل الاجتماعي"
    subtitle="متابعة الطلبة والحجوزات"
  >
    <slot />
  </RoleDashboardShell>
</template>

<script setup>
import RoleDashboardShell from "~/components/dashboard/RoleDashboardShell.vue";
</script>
