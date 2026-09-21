<template>
  <AdminReportsPage />
</template>

<script setup>
import AdminReportsPage from "~/components/dashboard/pages/reports/admin/AdminReportsPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
