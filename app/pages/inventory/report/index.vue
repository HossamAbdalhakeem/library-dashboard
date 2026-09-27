<template>
  <InventoryReportPageIndex />
</template>

<script setup>
import InventoryReportPageIndex from "~/components/dashboard/pages/inventory/report/InventoryReportPageIndex.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
