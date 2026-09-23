<template>
  <RoleDashboardShell
    :role="UserRole.CUSTOMER_SERVICE"
    title="لوحة خدمة العملاء"
  >
    <slot />
  </RoleDashboardShell>
</template>

<script setup>
import RoleDashboardShell from "~/components/dashboard/RoleDashboardShell/RoleDashboardShellIndex.vue";
import { UserRole } from "~/enums/userRole";
</script>
