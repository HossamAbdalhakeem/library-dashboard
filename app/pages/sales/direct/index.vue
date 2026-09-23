<template>
  <DirectSalesPageIndex />
</template>

<script setup>
import DirectSalesPageIndex from "~/components/dashboard/pages/sales/direct/DirectSalesPageIndex.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
