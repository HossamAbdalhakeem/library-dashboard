<template>
  <UsersPageIndex />
</template>

<script setup>
import UsersPageIndex from "~/components/dashboard/pages/users/UsersPageIndex.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
