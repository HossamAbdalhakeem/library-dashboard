<template>
  <header
    class="sticky top-0 z-20 border-b border-white/10 bg-black/90 px-3 py-3 backdrop-blur-sm sm:px-6 sm:py-5"
  >
    <div class="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
      <div class="flex min-w-0 items-center gap-2 sm:gap-3">
        <RoleDashboardHeaderMenuButton @open-mobile="$emit('open-mobile')" />
        <div class="min-w-0">
          <h1
            class="mt-0.5 truncate text-lg font-bold text-slate-400 sm:text-2xl"
          >
            {{ title }}
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <NotificationBell
          v-if="normalizedRole !== UserRole.CUSTOMER_SERVICE"
        />
        <RoleDashboardHeaderUser
          :user-initials="userInitials"
          :user-name="userName"
          :role-label="roleLabel"
          :context-label="contextLabel"
        />
      </div>
    </div>
  </header>
</template>

<script setup>
import RoleDashboardHeaderMenuButton from "./partials/RoleDashboardHeaderMenuButton.vue";
import RoleDashboardHeaderUser from "./partials/RoleDashboardHeaderUser.vue";
import { UserRole } from "~/enums/userRole";

const NotificationBell = defineAsyncComponent(() =>
  import("~/components/dashboard/NotificationBell/index.vue"),
);

defineOptions({ name: "RoleDashboardHeader" });

defineProps({
  title: { type: String, default: "لوحة التحكم" },
  subtitle: { type: String, default: "نظرة عامة" },
  normalizedRole: { type: String, default: UserRole.ADMIN },
  userInitials: { type: String, default: "" },
  userName: { type: String, default: "" },
  roleLabel: { type: String, default: "" },
  contextLabel: { type: String, default: "" },
});

defineEmits(["open-mobile"]);
</script>
