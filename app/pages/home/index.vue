<template>
  <AdminHomePage />
</template>

<script setup>
import AdminHomePage from "~/components/dashboard/pages/home/AdminHomePage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
