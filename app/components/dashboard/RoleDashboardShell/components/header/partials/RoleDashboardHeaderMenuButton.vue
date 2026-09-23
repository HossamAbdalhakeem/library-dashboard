<template>
  <button
    type="button"
    class="rounded-xl border border-white/10 bg-[#111111] p-2.5 text-slate-200 hover:bg-white/5 lg:hidden"
    aria-label="فتح القائمة"
    @click="$emit('open-mobile')"
  >
    ☰
  </button>
</template>

<script setup>
defineOptions({ name: "RoleDashboardHeaderMenuButton" });

defineEmits(["open-mobile"]);
</script>
