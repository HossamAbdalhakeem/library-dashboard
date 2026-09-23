<template>
  <CustomerServiceReportsPageIndex />
</template>

<script setup>
import CustomerServiceReportsPageIndex from "~/components/dashboard/pages/reports/customer-service/CustomerServiceReportsPageIndex.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
