<template>
  <Toast position="top-right" />
  <NuxtRouteAnnouncer />

  <SessionWelcomeSplash v-if="sessionLoading" />

  <NuxtLayout v-else :name="resolvedLayoutName">
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import Toast from "primevue/toast";
import SessionWelcomeSplash from "~/components/shared/session-welcome-splash/index.vue";
import { useAuth } from "~/composables/useAuth";

const route = useRoute();
const { sessionLoading, layoutName } = useAuth();

const resolvedLayoutName = computed(() => {
  // Only switch to login layout on the login route (avoids remount mid-logout)
  if (route.path === "/login") return "login";
  return layoutName.value;
});
</script>
