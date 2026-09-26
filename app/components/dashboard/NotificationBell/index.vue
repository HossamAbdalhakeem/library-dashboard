<template>
  <div ref="rootRef" class="relative" dir="rtl">
    <button
      ref="buttonRef"
      type="button"
      class="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[var(--app-card)] text-[var(--app-text-strong)] transition hover:bg-[var(--app-overlay-hover)]"
      aria-label="الإشعارات"
      @click="toggle"
    >
      <i class="pi pi-bell text-base" />
      <span
        v-if="notifications.length"
        class="absolute -left-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white"
      >
        {{ notifications.length > 99 ? "99+" : notifications.length }}
      </span>
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="panelRef"
        class="fixed z-[10000] w-[22rem] max-w-[85vw] overflow-hidden rounded-2xl border border-white/10 bg-[var(--app-surface)] shadow-2xl"
        :style="panelStyle"
        dir="rtl"
      >
        <div class="border-b border-white/10 px-4 py-3">
          <p class="text-sm font-semibold text-[var(--app-text-strong)]">تنبيهات المخزون</p>
        </div>

        <div class="max-h-80 overflow-y-auto">
          <div v-if="loading && !notifications.length" class="space-y-3 px-4 py-4">
            <div
              v-for="i in 4"
              :key="i"
              class="rounded-xl border border-white/5 bg-[var(--app-elevated)] p-3"
            >
              <Skeleton width="55%" height="0.85rem" class="mb-2" />
              <Skeleton width="100%" height="0.7rem" class="mb-1.5" />
              <Skeleton width="40%" height="0.55rem" />
            </div>
          </div>

          <div
            v-else-if="!notifications.length"
            class="px-4 py-8 text-center text-sm text-slate-500"
          >
            لا توجد منتجات منخفضة المخزون حالياً
          </div>

          <div
            v-for="item in notifications"
            :key="item.id"
            class="flex flex-col gap-1 border-b border-white/5 px-4 py-3 text-right"
          >
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-semibold text-[var(--app-text-strong)]">{{ item.title }}</p>
              <span
                class="shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300"
              >
                متاح {{ item.availableQuantity ?? "—" }}
              </span>
            </div>
            <p class="text-xs leading-5 text-slate-300">{{ item.message }}</p>
            <p v-if="item.createdAt" class="text-[11px] text-slate-500">
              {{ formatTime(item.createdAt) }}
            </p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import {
  notificationApi,
  normalizeNotificationListItem,
} from "~/services/notification";
import { useAuth } from "~/composables/useAuth";
import { useAppToast } from "~/composables/useAppToast";
import { useAcademicYear } from "~/composables/useAcademicYear";
import { formatDateTime } from "~/utils/format/datetime";

defineOptions({ name: "NotificationBell" });

const POLL_MS = 10 * 60 * 1000;

const { isLoggedIn, token } = useAuth();
const { toast } = useAppToast();
const { academicYearId: currentAcademicYearId } = useAcademicYear();

const open = ref(false);
const loading = ref(false);
const notifications = ref([]);
const lastFirstId = ref(null);
const panelStyle = ref({});

const rootRef = ref(null);
const buttonRef = ref(null);
const panelRef = ref(null);
let pollTimer = null;
let fetching = false;

const formatTime = (value) =>
  formatDateTime(value, {
    dateStyle: "short",
    timeStyle: "short",
    empty: "",
  });

const sameList = (next) => {
  const prev = notifications.value;
  if (prev.length !== next.length) return false;
  return prev.every((item, i) => String(item.id) === String(next[i]?.id));
};

const updatePanelPosition = () => {
  const button = buttonRef.value;
  if (!button) return;
  const rect = button.getBoundingClientRect();
  const width = Math.min(352, window.innerWidth * 0.85);
  const left = Math.min(rect.left, window.innerWidth - width - 8);
  panelStyle.value = {
    top: `${Math.round(rect.bottom + 8)}px`,
    left: `${Math.max(8, left)}px`,
  };
};

const loadNotifications = async ({ showLoading = false } = {}) => {
  if (!isLoggedIn.value || !token.value || fetching) return;
  fetching = true;
  if (showLoading) loading.value = true;

  try {
    const list = (await notificationApi.getNotifications()).map(
      normalizeNotificationListItem,
    );
    const first = list[0];

    if (
      first &&
      lastFirstId.value &&
      String(first.id) !== String(lastFirstId.value)
    ) {
      toast.add({
        severity: "warn",
        summary: first.title,
        detail: first.message,
        life: 6000,
      });
    }

    if (first) lastFirstId.value = String(first.id);
    if (!sameList(list)) notifications.value = list;
  } catch {
    // silent on poll failures
  } finally {
    loading.value = false;
    fetching = false;
  }
};

const startPolling = () => {
  if (!import.meta.client || pollTimer) return;
  loadNotifications();
  pollTimer = setInterval(() => loadNotifications(), POLL_MS);
};

const stopPolling = () => {
  if (!pollTimer) return;
  clearInterval(pollTimer);
  pollTimer = null;
};

const toggle = async () => {
  open.value = !open.value;
  if (!open.value) return;
  await nextTick();
  updatePanelPosition();
  await loadNotifications({ showLoading: !notifications.value.length });
};

const onDocumentClick = (event) => {
  if (!open.value) return;
  const target = event.target;
  if (rootRef.value?.contains(target) || panelRef.value?.contains(target)) return;
  open.value = false;
};

const onWindowChange = () => {
  if (open.value) updatePanelPosition();
};

onMounted(() => {
  startPolling();
  document.addEventListener("click", onDocumentClick);
  window.addEventListener("resize", onWindowChange);
  window.addEventListener("scroll", onWindowChange, true);
});

watch(
  isLoggedIn,
  (loggedIn) => {
    if (!loggedIn) {
      open.value = false;
      stopPolling();
      return;
    }
    startPolling();
  },
);

watch(currentAcademicYearId, () => {
  lastFirstId.value = null;
  notifications.value = [];
  if (isLoggedIn.value) {
    loadNotifications({ showLoading: open.value });
  }
});

onBeforeUnmount(() => {
  stopPolling();
  document.removeEventListener("click", onDocumentClick);
  window.removeEventListener("resize", onWindowChange);
  window.removeEventListener("scroll", onWindowChange, true);
});
</script>
