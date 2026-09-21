<template>
  <button
    class="flex items-center gap-3 rounded-full p-1.5 pr-3 hover:bg-forest/20"
    type="button"
    aria-label="Open account menu"
  >
    <span
      class="grid size-10 place-items-center rounded-full bg-forest text-sm font-bold text-mint"
      >{{ initials }}</span
    >
    <span class="hidden text-left sm:block">
      <span class="block text-sm font-semibold text-mint">{{
        displayName
      }}</span>
      <span class="block text-xs text-muted">Account</span>
    </span>
  </button>
</template>

<script setup>
import { useAuthStore } from "~/store/auth.js";

defineEmits(["toggle-menu"]);
const authStore = useAuthStore();
const displayName = computed(
  () => authStore.user?.name || authStore.user?.full_name || "Your account"
);
const initials = computed(() => {
  const parts = String(displayName.value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join(" ")
    .toUpperCase();
});
</script>

<style lang="scss" scoped>
</style>