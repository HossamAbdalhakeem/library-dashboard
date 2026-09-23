<template>
  <AdminReportsPageIndex />
</template>

<script setup>
import AdminReportsPageIndex from "~/components/dashboard/pages/reports/admin/AdminReportsPageIndex.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
