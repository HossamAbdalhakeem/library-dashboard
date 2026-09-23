<template>
  <LoginPageIndex />
</template>

<script setup>
import LoginPageIndex from "~/components/login/LoginPageIndex.vue";

definePageMeta({
  middleware: ["local-auth-user"],
  layout: "login",
});
</script>
