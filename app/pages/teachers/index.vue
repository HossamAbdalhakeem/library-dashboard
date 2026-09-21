<template>
  <TeachersPage />
</template>

<script setup>
import TeachersPage from "~/components/dashboard/pages/teachers/TeachersPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
