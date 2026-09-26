<script setup>
definePageMeta({ middleware: ["local-pages"] });

await navigateTo("/reports/branch", { replace: true });
</script>

<template>
  <div class="p-6 text-sm text-slate-400">جاري فتح التقرير…</div>
</template>
