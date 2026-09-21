<template>
  <SalesExchangePage />
</template>

<script setup>
import SalesExchangePage from "~/components/dashboard/pages/sales/exchange/SalesExchangePage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
