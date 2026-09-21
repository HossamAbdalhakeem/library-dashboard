<template>
  <BranchesPage />
</template>

<script setup>
import BranchesPage from "~/components/dashboard/pages/branches/BranchesPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
