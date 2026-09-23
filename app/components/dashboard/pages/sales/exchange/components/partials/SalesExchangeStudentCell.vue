<template>
  <div class="flex flex-col gap-0.5">
    <span class="font-medium text-slate-900">{{ name }}</span>
    <span class="text-xs text-slate-500">{{ phone || "—" }}</span>
  </div>
</template>

<script setup>
defineOptions({ name: "SalesExchangeStudentCell" });

defineProps({
  name: { type: String, default: "-" },
  phone: { type: String, default: "" },
});
</script>
