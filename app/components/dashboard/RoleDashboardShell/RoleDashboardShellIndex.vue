<template>
  <div class="min-h-screen bg-black text-slate-100" dir="rtl">
    <div
      v-if="mobileNavOpen"
      class="fixed inset-0 z-30 bg-black/50 lg:hidden"
      aria-hidden="true"
      @click="mobileNavOpen = false"
    />

    <RoleDashboardSidebar
      :mobile-nav-open="mobileNavOpen"
      :navigation="navigation"
      :open-section-id="openSectionId"
      :is-active="isActive"
      @close-mobile="mobileNavOpen = false"
      @toggle-section="toggleSection"
      @request-logout="confirmLogoutVisible = true"
    />

    <div class="min-h-screen lg:mr-72">
      <RoleDashboardHeader
        :title="title"
        :normalized-role="normalizedRole"
        :user-initials="userInitials"
        :user-name="userName"
        :role-label="roleLabel"
        :context-label="contextLabel"
        @open-mobile="mobileNavOpen = true"
      />

      <main class="p-3 sm:p-6">
        <div
          v-if="stats.length"
          class="mb-4 grid gap-3 sm:mb-6 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="rounded-2xl border border-white/10 bg-[#111111] p-4 shadow-sm"
          >
            <div class="flex items-center justify-between gap-2">
              <p class="text-sm text-slate-400">{{ stat.label }}</p>
              <span
                class="shrink-0 rounded-lg bg-primary-500/15 px-2 py-1 text-xs font-semibold text-primary-200"
                >{{ stat.tag }}</span
              >
            </div>
            <p class="mt-3 text-2xl font-bold text-white sm:mt-4 sm:text-3xl">
              {{ stat.value }}
            </p>
            <p class="mt-2 text-xs text-slate-400">{{ stat.note }}</p>
          </div>
        </div>

        <slot />
      </main>
    </div>

    <RoleDashboardLogoutDialog
      v-model:visible="confirmLogoutVisible"
      :logging-out="loggingOut"
      @confirm="confirmLogout"
    />
  </div>
</template>

<script setup>
import RoleDashboardSidebar from "./components/sidebar/RoleDashboardSidebar.vue";
import RoleDashboardHeader from "./components/header/RoleDashboardHeader.vue";
import RoleDashboardLogoutDialog from "./components/partials/RoleDashboardLogoutDialog.vue";
import { useRoleDashboardShell } from "./composables/useRoleDashboardShell.js";
import { UserRole } from "~/enums/userRole";

defineOptions({ name: "RoleDashboardShellIndex" });

const props = defineProps({
  role: { type: String, default: UserRole.ADMIN },
  title: { type: String, default: "لوحة التحكم" },
  stats: { type: Array, default: () => [] },
});

const {
  confirmLogoutVisible,
  loggingOut,
  mobileNavOpen,
  openSectionId,
  normalizedRole,
  navigation,
  isActive,
  toggleSection,
  userName,
  userInitials,
  roleLabel,
  contextLabel,
  confirmLogout,
} = useRoleDashboardShell(props);
</script>
