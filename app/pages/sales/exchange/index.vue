<template>
  <SalesExchangePageIndex />
</template>

<script setup>
import SalesExchangePageIndex from "~/components/dashboard/pages/sales/exchange/SalesExchangePageIndex.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
