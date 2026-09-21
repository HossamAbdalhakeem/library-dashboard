<template>
  <div class="relative">
    <button
      class="relative grid size-10 place-items-center rounded-lg text-muted hover:bg-forest/20"
      type="button"
      aria-label="Notifications"
      @click="isOpen = !isOpen"
    >
      <span class="text-xl" aria-hidden="true">🔔</span>
      <span v-if="unreadCount > 0" class="absolute top-0 right-0 grid size-5 place-items-center rounded-full bg-red-500 text-xs font-bold text-white">
        {{ unreadCount > 9 ? "9+" : unreadCount }}
      </span>
    </button>

    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 sm:hidden"
      aria-hidden="true"
      @click="isOpen = false"
    />

    <div
      v-show="isOpen"
      class="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-1rem)] rounded-lg border border-forest/40 bg-ink shadow-lg sm:max-w-sm"
    >
      <div class="border-b border-forest/40 px-4 py-3">
        <h3 class="text-sm font-semibold text-mint">Recent notifications</h3>
      </div>

      <div class="max-h-96 overflow-y-auto">
        <div v-if="recentNotifications.length === 0" class="px-4 py-8 text-center text-sm text-muted">
          No notifications yet
        </div>

        <button
          v-for="notif in recentNotifications"
          :key="notif.id"
          type="button"
          class="w-full border-b border-forest/20 px-4 py-3 text-left text-sm hover:bg-forest/20"
          @click="handleNotificationClick(notif)"
        >
          <div :class="['flex gap-3', notif.read ? 'opacity-75' : '']">
            <span class="mt-1 text-xl" aria-hidden="true">{{ notif.icon }}</span>
            <div class="min-w-0 flex-1">
              <p class="font-medium text-mint">{{ notif.title }}</p>
              <p class="text-xs text-muted">{{ notif.time }}</p>
            </div>
            <div v-if="!notif.read" class="mt-2 size-2 rounded-full bg-forest" aria-hidden="true"/>
          </div>
        </button>
      </div>

      <NuxtLink
        class="block border-t border-forest/40 px-4 py-3 text-center text-sm font-semibold text-forest hover:bg-forest/20"
        to="/"
        @click="isOpen = false"
      >
        See all notifications
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const isOpen = ref(false);

const recentNotifications = ref([
  {
    id: 1,
    title: "New creator joined",
    time: "5 minutes ago",
    icon: "👤",
    read: false,
  },
  {
    id: 2,
    title: "Campaign reached 50% funding",
    time: "1 hour ago",
    icon: "🎯",
    read: false,
  },
  {
    id: 3,
    title: "Payment received",
    time: "3 hours ago",
    icon: "💰",
    read: true,
  },
]);

const unreadCount = computed(() => recentNotifications.value.filter((n) => !n.read).length);

const handleNotificationClick = (notif) => {
  notif.read = true;
  isOpen.value = false;
};
</script>
