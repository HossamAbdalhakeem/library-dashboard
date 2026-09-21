<template>
  <StudyYearsPage />
</template>

<script setup>
import StudyYearsPage from "~/components/dashboard/pages/study-years/StudyYearsPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
