<template>
  <StudentsPage />
</template>

<script setup>
import StudentsPage from "~/components/dashboard/pages/students/StudentsPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
