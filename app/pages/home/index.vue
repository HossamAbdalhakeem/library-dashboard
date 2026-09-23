<template>
  <AdminHomePageIndex />
</template>

<script setup>
import AdminHomePageIndex from "~/components/dashboard/pages/home/AdminHomePageIndex.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
