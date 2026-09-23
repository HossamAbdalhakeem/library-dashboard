<template>
  <StudyYearsPageIndex />
</template>

<script setup>
import StudyYearsPageIndex from "~/components/dashboard/pages/study-years/StudyYearsPageIndex.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
