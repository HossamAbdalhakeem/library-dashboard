<template>
  <DirectSalesPage />
</template>

<script setup>
import DirectSalesPage from "~/components/dashboard/pages/sales/direct/DirectSalesPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
