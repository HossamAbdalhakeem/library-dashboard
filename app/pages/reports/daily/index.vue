<script setup>
import { useAuth } from "~/composables/useAuth";

definePageMeta({ middleware: ["local-pages"] });

const { isCustomerService } = useAuth();

const resolveDailyReportPath = () =>
  isCustomerService.value ? "/reports/customer-service" : "/reports/branch";

await navigateTo(resolveDailyReportPath(), { replace: true });
</script>

<template>
  <div class="p-6 text-sm text-slate-400">جاري فتح التقرير…</div>
</template>
