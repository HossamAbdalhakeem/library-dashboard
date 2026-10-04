<template>
  <AdminAttendancePageIndex />
</template>

<script setup>
import AdminAttendancePageIndex from "~/components/dashboard/pages/attendance/admin/AdminAttendancePageIndex.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
