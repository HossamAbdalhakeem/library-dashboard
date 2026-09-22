<template>
  <RoleDashboardShell
    role="admin"
    title="لوحة مدير النظام"
  >
    <slot />
  </RoleDashboardShell>
</template>

<script setup>
import RoleDashboardShell from "~/components/dashboard/RoleDashboardShell.vue";
</script>
