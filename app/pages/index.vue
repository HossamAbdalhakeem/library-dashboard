<template>
  <div />
</template>

<script setup>
import { useAuthStore } from "~/store/auth.js";
import { homeForRole } from "~/utils/routeAccess";

const authStore = useAuthStore();

definePageMeta({
  middleware: ["local-pages"],
});

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    await navigateTo("/login");
    return;
  }

  const role = authStore.user?.role || "admin";
  await navigateTo(homeForRole(role));
});
</script>
