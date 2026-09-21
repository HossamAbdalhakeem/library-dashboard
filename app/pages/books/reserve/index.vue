<template>
  <ReserveBookPage />
</template>

<script setup>
import ReserveBookPage from "~/components/dashboard/pages/books/reserve/ReserveBookPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
