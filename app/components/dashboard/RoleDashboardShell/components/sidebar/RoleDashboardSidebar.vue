<template>
  <aside
    class="fixed inset-y-0 right-0 z-40 w-72 max-w-[85vw] flex-col border-l border-white/10 bg-[var(--app-surface)] text-[var(--app-text-strong)] shadow-xl"
    :class="mobileNavOpen ? 'flex' : 'hidden lg:flex'"
  >
    <RoleDashboardSidebarBrand @close-mobile="$emit('close-mobile')" />

    <RoleDashboardSidebarNav
      :navigation="navigation"
      :open-section-id="openSectionId"
      :is-active="isActive"
      @close-mobile="$emit('close-mobile')"
      @toggle-section="$emit('toggle-section', $event)"
    />

    <RoleDashboardSidebarFooter
      @request-logout="$emit('request-logout')"
    />
  </aside>
</template>

<script setup>
import RoleDashboardSidebarBrand from "./partials/RoleDashboardSidebarBrand.vue";
import RoleDashboardSidebarNav from "./partials/RoleDashboardSidebarNav.vue";
import RoleDashboardSidebarFooter from "./partials/RoleDashboardSidebarFooter.vue";

defineOptions({ name: "RoleDashboardSidebar" });

defineProps({
  mobileNavOpen: { type: Boolean, default: false },
  navigation: { type: Array, default: () => [] },
  openSectionId: { type: [String, Number], default: null },
  isActive: { type: Function, required: true },
});

defineEmits(["close-mobile", "toggle-section", "request-logout"]);
</script>
