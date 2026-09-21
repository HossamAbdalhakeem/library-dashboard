<template>
  <ExpensesPage />
</template>

<script setup>
import ExpensesPage from "~/components/dashboard/pages/expenses/ExpensesPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
