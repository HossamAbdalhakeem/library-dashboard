<template>
  <ReserveBookPageIndex />
</template>

<script setup>
import ReserveBookPageIndex from "~/components/dashboard/pages/books/reserve/ReserveBookPageIndex.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
