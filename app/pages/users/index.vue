<template>
  <UsersPage />
</template>

<script setup>
import UsersPage from "~/components/dashboard/pages/users/UsersPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
