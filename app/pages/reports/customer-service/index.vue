<template>
  <CustomerServiceReportsPage />
</template>

<script setup>
import CustomerServiceReportsPage from "~/components/dashboard/pages/reports/customer-service/CustomerServiceReportsPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
