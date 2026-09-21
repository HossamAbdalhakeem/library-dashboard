<template>
  <RoleDashboardShell
    role="admin"
    title="لوحة مدير النظام"
    subtitle="نظرة عامة على العمليات"
  >
    <slot />
  </RoleDashboardShell>
</template>

<script setup>
import RoleDashboardShell from "~/components/dashboard/RoleDashboardShell.vue";
</script>
