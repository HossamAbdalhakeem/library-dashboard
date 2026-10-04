<template>
  <SalesReportPageIndex />
</template>

<script setup>
import SalesReportPageIndex from "~/components/dashboard/pages/sales/report/SalesReportPageIndex.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
