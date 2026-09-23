<template>
  <TeacherPageIndex />
</template>

<script setup>
import TeacherPageIndex from "~/components/dashboard/pages/teachers/TeacherPageIndex.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
