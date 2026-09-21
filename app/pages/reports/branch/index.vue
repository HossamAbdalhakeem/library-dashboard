<template>
  <BranchEmployeeReportsPage />
</template>

<script setup>
import BranchEmployeeReportsPage from "~/components/dashboard/pages/reports/branch/BranchEmployeeReportsPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
