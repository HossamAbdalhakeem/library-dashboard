<template>
  <ProductsPage />
</template>

<script setup>
import ProductsPage from "~/components/dashboard/pages/products/ProductsPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
