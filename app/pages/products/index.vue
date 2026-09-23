<template>
  <ProductsPageIndex />
</template>

<script setup>
import ProductsPageIndex from "~/components/dashboard/pages/products/ProductsPageIndex.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
