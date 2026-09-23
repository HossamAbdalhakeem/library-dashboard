<template>
  <RoleDashboardShell
    :role="UserRole.ADMIN"
    title="لوحة مدير النظام"
  >
    <slot />
  </RoleDashboardShell>
</template>

<script setup>
import RoleDashboardShell from "~/components/dashboard/RoleDashboardShell/RoleDashboardShellIndex.vue";
import { UserRole } from "~/enums/userRole";
</script>
