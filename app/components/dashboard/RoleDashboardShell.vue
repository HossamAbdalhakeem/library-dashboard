<template>
  <div class="min-h-screen bg-black text-slate-100" dir="rtl">
    <!-- Mobile overlay -->
    <div
      v-if="mobileNavOpen"
      class="fixed inset-0 z-30 bg-black/50 lg:hidden"
      aria-hidden="true"
      @click="mobileNavOpen = false"
    />

    <aside
      class="fixed inset-y-0 right-0 z-40 w-72 max-w-[85vw] flex-col border-l border-white/10 bg-[#0a0a0a] text-slate-100 shadow-xl"
      :class="mobileNavOpen ? 'flex' : 'hidden lg:flex'"
    >
      <div
        class="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5"
      >
        <div>
          <p class="text-xs tracking-[0.28em] text-primary-200/80">مكتبة</p>
          <h2 class="mt-1 text-lg font-bold sm:text-xl">لوحة التحكم</h2>
        </div>
        <button
          type="button"
          class="rounded-lg p-2 text-slate-300 hover:bg-white/5 lg:hidden"
          aria-label="إغلاق القائمة"
          @click="mobileNavOpen = false"
        >
          ✕
        </button>
      </div>

      <nav
        class="flex-1 space-y-2 overflow-y-auto px-3 py-4 pb-44 sm:px-4 sm:py-5"
        aria-label="القائمة الرئيسية"
      >
        <div
          v-for="section in navigation"
          :key="section.id"
          class="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]"
        >
          <button
            v-if="section.label"
            type="button"
            class="flex w-full items-center justify-between gap-2 px-3 py-3 text-right transition hover:bg-white/5"
            :aria-expanded="openSectionId === section.id"
            @click="toggleSection(section.id)"
          >
            <span class="text-xs font-bold tracking-wide text-primary-300">
              {{ section.label }}
            </span>
            <span
              class="text-sm text-slate-400 transition-transform duration-200"
              :class="openSectionId === section.id ? 'rotate-180' : ''"
              aria-hidden="true"
            >
              ▾
            </span>
          </button>

          <div
            v-show="!section.label || openSectionId === section.id"
            class="space-y-1 px-2 pb-2"
            :class="section.label ? 'border-t border-white/5 pt-1' : 'pt-2'"
          >
            <NuxtLink
              v-for="item in section.items"
              :key="item.to"
              :to="item.to"
              class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-right text-sm font-medium transition hover:bg-white/5"
              :class="
                isActive(item.to)
                  ? 'bg-[#1a1a1a] text-primary-200 ring-1 ring-primary-500/40'
                  : 'text-slate-300'
              "
              @click="mobileNavOpen = false"
            >
              <span>{{ item.label }}</span>
              <span class="text-lg" aria-hidden="true">{{ item.icon }}</span>
            </NuxtLink>
          </div>
        </div>
      </nav>

      <div
        class="absolute bottom-0 left-0 right-0 space-y-3 border-t border-white/10 bg-[#0a0a0a] p-3 sm:p-4"
      >
        <!-- Hidden for now
        <AcademicYearSwitcher />
        -->
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-xl bg-red-500/10 px-3 py-3 text-sm font-medium text-red-200 hover:bg-red-500/20"
          @click="confirmLogoutVisible = true"
        >
          <span>تسجيل الخروج</span>
          <span>⎋</span>
        </button>
      </div>
    </aside>

    <div class="min-h-screen lg:mr-72">
      <header
        class="border-b border-white/10 bg-black/90 px-3 py-3 backdrop-blur-sm sm:px-6 sm:py-5"
      >
        <div class="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div class="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              class="rounded-xl border border-white/10 bg-[#111111] p-2.5 text-slate-200 hover:bg-white/5 lg:hidden"
              aria-label="فتح القائمة"
              @click="mobileNavOpen = true"
            >
              ☰
            </button>
            <div class="min-w-0">
              <p class="truncate text-xs text-slate-400 sm:text-sm">{{ title }}</p>
              <h1 class="mt-0.5 truncate text-lg font-bold text-white sm:mt-1 sm:text-2xl">
                {{ subtitle }}
              </h1>
            </div>
          </div>

          <div class="flex items-center gap-2 sm:gap-3">
            <NotificationBell v-if="normalizedRole !== 'social'" />
            <div
              class="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#111111] px-2 py-1.5 shadow-sm sm:gap-3 sm:px-3 sm:py-2"
            >
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white sm:h-10 sm:w-10"
              >
                {{ userInitials }}
              </div>
              <div class="hidden text-right sm:block">
                <p class="max-w-[9rem] truncate text-sm font-semibold text-white sm:max-w-none">
                  {{ userName }}
                </p>
                <p class="text-xs text-neutral-400">{{ roleLabel }}</p>
              </div>
            </div>
            <div
              v-if="contextLabel"
              class="rounded-2xl border border-white/10 bg-[#111111] px-3 py-1.5 text-sm font-semibold text-white shadow-sm sm:px-4 sm:py-2"
            >
              {{ contextLabel }}
            </div>
          </div>
        </div>
      </header>

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

    <Dialog
      v-model:visible="confirmLogoutVisible"
      modal
      header="تأكيد تسجيل الخروج"
      :style="{ width: '28rem', maxWidth: '95vw' }"
      :dismissableMask="true"
      dir="rtl"
    >
      <p class="text-right text-sm text-slate-600">
        هل أنت متأكد من تسجيل الخروج؟ سيتم إنهاء الجلسة وإبطال رمز الدخول
        الحالي.
      </p>
      <template #footer>
        <div class="flex flex-wrap justify-end gap-2">
          <Button
            label="إلغاء"
            severity="secondary"
            text
            :disabled="loggingOut"
            @click="confirmLogoutVisible = false"
          />
          <Button
            label="تسجيل الخروج"
            severity="danger"
            :loading="loggingOut"
            @click="confirmLogout"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import { useAuthStore } from "~/store/auth.js";

const NotificationBell = defineAsyncComponent(() =>
  import("~/components/dashboard/NotificationBell.vue"),
);
// Hidden for now with the sidebar switcher
// const AcademicYearSwitcher = defineAsyncComponent(() =>
//   import("~/components/dashboard/AcademicYearSwitcher.vue"),
// );

const props = defineProps({
  role: { type: String, default: "admin" },
  title: { type: String, default: "لوحة التحكم" },
  subtitle: { type: String, default: "نظرة عامة" },
  stats: { type: Array, default: () => [] },
});

const authStore = useAuthStore();
const route = useRoute();
const confirmLogoutVisible = ref(false);
const loggingOut = ref(false);
const mobileNavOpen = ref(false);
/** Accordion: only one labeled section open at a time (null = all closed) */
const openSectionId = ref(null);

const roleLabels = {
  admin: { short: "AD", label: "مدير" },
  branch: { short: "BR", label: "فرع" },
  social: { short: "SO", label: "اجتماعي" },
};

const normalizedRole = computed(() => {
  const raw = String(
    props.role || authStore.user?.role || "admin"
  ).toLowerCase();
  if (raw === "admin" || raw === "administrator") return "admin";
  if (
    raw === "branch" ||
    raw === "library_employee" ||
    raw === "branch_employee"
  ) {
    return "branch";
  }
  if (
    raw === "social" ||
    raw === "customer_service" ||
    raw === "customer-service"
  ) {
    return "social";
  }
  return "admin";
});

const roleMeta = computed(
  () => roleLabels[normalizedRole.value] || roleLabels.admin
);

const isActive = (to) => {
  const path = route.path;
  if (to === "/home") return path === "/home" || path === "/";
  if (to === "/reservations") return path === "/reservations";
  if (to === "/reports") {
    return path === "/reports";
  }
  return path === to || path.startsWith(`${to}/`);
};

const toggleSection = (sectionId) => {
  openSectionId.value = openSectionId.value === sectionId ? null : sectionId;
};

const sectionHasActiveItem = (section) =>
  (section.items || []).some((item) => isActive(item.to));

const openActiveSection = () => {
  const active = navigation.value.find(
    (section) => section.label && sectionHasActiveItem(section)
  );
  openSectionId.value =
    active?.id || navigation.value.find((s) => s.label)?.id || null;
};

/** Single menu source — admin uses labeled groups; other roles use one unlabeled group */
const navigation = computed(() => {
  const role = normalizedRole.value;
  void route.path;

  if (role === "branch") {
    return [
      {
        id: "branch-main",
        label: "",
        items: [
          { label: "البيع المباشر", icon: "◫", to: "/sales/direct" },
          { label: "حجز الكتب", icon: "✓", to: "/reservations" },
          { label: "تسليم الحجز", icon: "📝", to: "/reservations/deliver" },
          { label: "التقرير", icon: "▤", to: "/reports/branch" },
        ],
      },
    ];
  }

  if (role === "social") {
    return [
      {
        id: "social-main",
        label: "",
        items: [
          { label: "احجز كتاب", icon: "📝", to: "/books/reserve" },
          { label: "التقرير", icon: "▤", to: "/reports/customer-service" },
        ],
      },
    ];
  }

  return [
    {
      id: "home",
      label: "",
      items: [{ label: "الرئيسية", icon: "⌂", to: "/home" }],
    },
    {
      id: "base",
      label: "البيانات الأساسية",
      items: [
        { label: "المنتجات", icon: "＋", to: "/products" },
        { label: "المدرسون", icon: "◉", to: "/teachers" },
        { label: "السنوات الدراسية", icon: "▦", to: "/study-years" },
        { label: "الفروع", icon: "⬡", to: "/branches" },
        { label: "الطلاب", icon: "◎", to: "/students" },
      ],
    },
    {
      id: "operations",
      label: "العمليات",
      items: [
        { label: "الحجوزات", icon: "✓", to: "/reservations/manage" },
        { label: "المبيعات", icon: "⇄", to: "/sales/exchange" },
      ],
    },
    {
      id: "people",
      label: "الأشخاص",
      items: [{ label: "الموظفون", icon: "♟", to: "/users" }],
    },
    {
      id: "finance",
      label: "المالية والتقارير",
      items: [
        { label: "المصروفات", icon: "⊖", to: "/expenses" },
        { label: "التقارير", icon: "▤", to: "/reports" },
      ],
    },
  ];
});

const userName = computed(() => authStore.user?.name || "مدير النظام");
const userInitials = computed(() => {
  const parts = String(userName.value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "M N";
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join(" ")
    .toUpperCase();
});
const roleLabel = computed(() => roleMeta.value.label);

/** Top-left context: branch name for employees, Customer Service for CS role */
const contextLabel = computed(() => {
  const branchName =
    authStore.user?.branch?.name ||
    authStore.user?.branches?.[0]?.name ||
    "";
  if (branchName) return branchName;
  if (normalizedRole.value === "social") return "خدمة العملاء";
  return "";
});

watch(
  () => [route.path, normalizedRole.value],
  () => {
    openActiveSection();
    mobileNavOpen.value = false;
  },
  { immediate: true }
);

watch(mobileNavOpen, (open) => {
  if (!import.meta.client) return;
  document.body.style.overflow = open ? "hidden" : "";
});

onBeforeUnmount(() => {
  if (!import.meta.client) return;
  document.body.style.overflow = "";
});

const confirmLogout = async () => {
  loggingOut.value = true;
  try {
    await authStore.logout();
  } finally {
    loggingOut.value = false;
    confirmLogoutVisible.value = false;
  }
};
</script>
