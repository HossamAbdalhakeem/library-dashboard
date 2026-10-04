<template>
  <AttendancePageIndex v-if="!admin" />
</template>

<script setup>
import AttendancePageIndex from "~/components/dashboard/pages/attendance/employee/AttendancePageIndex.vue";
import { useAuth } from "~/composables/useAuth";
import { isAdminRole } from "~/enums/userRole";

definePageMeta({ middleware: ["local-pages"] });

const { user } = useAuth();
const admin = computed(() => isAdminRole(user.value?.role));

if (admin.value) {
  await navigateTo("/attendance/manage", { replace: true });
}
</script>
