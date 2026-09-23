<template>
  <BranchEmployeeReportsPageIndex />
</template>

<script setup>
import BranchEmployeeReportsPageIndex from "~/components/dashboard/pages/reports/branch/BranchEmployeeReportsPageIndex.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
