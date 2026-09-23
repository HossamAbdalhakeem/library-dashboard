<template>
  <BranchesPageIndex />
</template>

<script setup>
import BranchesPageIndex from "~/components/dashboard/pages/branches/BranchesPageIndex.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
