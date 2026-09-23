<template>
  <StudentsPageIndex />
</template>

<script setup>
import StudentsPageIndex from "~/components/dashboard/pages/students/StudentsPageIndex.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
