<template>
  <RoleDashboardShell
    :role="UserRole.BRANCH_EMPLOYEE"
    title="لوحة فرع المكتبة"
  >
    <slot />
  </RoleDashboardShell>
</template>

<script setup>
import RoleDashboardShell from "~/components/dashboard/RoleDashboardShell/RoleDashboardShellIndex.vue";
import { UserRole } from "~/enums/userRole";
</script>
