<template>
  <Toast position="top-right" />
  <NuxtRouteAnnouncer />

  <SessionWelcomeSplash v-if="authStore.sessionLoading" />

  <NuxtLayout v-else :name="layoutName">
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import Toast from "primevue/toast";
import SessionWelcomeSplash from "~/components/shared/session-welcome-splash/index.vue";
import { useAuthStore } from "~/store/auth.js";

const route = useRoute();
const authStore = useAuthStore();

const layoutName = computed(() => {
  // Only switch to login layout on the login route (avoids remount mid-logout)
  if (route.path === "/login") return "login";

  const role = String(authStore.user?.role || "admin").toLowerCase();
  if (role === "branch" || role === "library_employee" || role === "branch_employee") {
    return "branch";
  }
  if (role === "social" || role === "customer_service" || role === "customer-service") {
    return "social";
  }
  return "admin";
});
</script>
