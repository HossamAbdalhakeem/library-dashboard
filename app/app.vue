<template>
  <Toast position="top-right" />
  <NuxtRouteAnnouncer />

  <div
    v-if="authStore.sessionLoading"
    class="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-black"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <ProgressSpinner
      strokeWidth="4"
      animationDuration=".8s"
      style="width: 3rem; height: 3rem"
      aria-label="جاري التحميل"
    />
    <!-- <p class="text-sm text-slate-400">جاري تحميل الجلسة…</p> -->
  </div>

  <NuxtLayout v-else :name="layoutName">
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import Toast from "primevue/toast";
import ProgressSpinner from "primevue/progressspinner";
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
