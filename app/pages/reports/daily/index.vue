<script setup>
import { useAuthStore } from "~/store/auth";

definePageMeta({ middleware: ["local-pages"] });

const authStore = useAuthStore();

const resolveDailyReportPath = () => {
  const raw = String(
    authStore.user?.role ||
      authStore.getRole ||
      authStore.dashboardRole ||
      "",
  ).toLowerCase();

  if (
    raw === "social" ||
    raw === "customer_service" ||
    raw === "customer-service"
  ) {
    return "/reports/customer-service";
  }

  return "/reports/branch";
};

await navigateTo(resolveDailyReportPath(), { replace: true });
</script>

<template>
  <div class="p-6 text-sm text-slate-400">جاري فتح التقرير…</div>
</template>
