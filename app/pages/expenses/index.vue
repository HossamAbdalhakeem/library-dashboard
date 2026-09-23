<template>
  <ExpensesPageIndex />
</template>

<script setup>
import ExpensesPageIndex from "~/components/dashboard/pages/expenses/ExpensesPageIndex.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
