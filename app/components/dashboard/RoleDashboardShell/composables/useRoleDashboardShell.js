import { useAuth } from "~/composables/useAuth";
import {
  getUserRoleLabel,
  normalizeUserRole,
  UserRole,
} from "~/enums/userRole";

function buildNavigation(role) {
  if (role === UserRole.BRANCH_EMPLOYEE) {
    return [
      {
        id: "branch-main",
        label: "",
        items: [
          // { label: "الطلاب", icon: "◎", to: "/students" },
          { label: "البيع المباشر", icon: "◫", to: "/sales/direct" },
          { label: "حجز الكتب", icon: "✓", to: "/reservations" },
          { label: "تسليم الحجز", icon: "📝", to: "/reservations/deliver" },
          // { label: "المبيعات / الاستبدال", icon: "⇄", to: "/sales/exchange" },
          { label: "التقرير", icon: "▤", to: "/reports/branch" },
        ],
      },
    ];
  }

  if (role === UserRole.CUSTOMER_SERVICE) {
    return [
      {
        id: "customer-service-main",
        label: "",
        items: [
          // { label: "الطلاب", icon: "◎", to: "/students" },
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
}

/**
 * Shell state: role, navigation accordion, mobile nav, user chip, logout.
 */
export function useRoleDashboardShell(props) {
  const { user, branch, isCustomerService, authStore } = useAuth();
  const route = useRoute();
  const confirmLogoutVisible = ref(false);
  const loggingOut = ref(false);
  const mobileNavOpen = ref(false);
  /** Accordion: only one labeled section open at a time (null = all closed) */
  const openSectionId = ref(null);

  const normalizedRole = computed(() =>
    normalizeUserRole(props.role || user.value?.role || UserRole.ADMIN),
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

  /** Single menu source — admin uses labeled groups; other roles use one unlabeled group */
  const navigation = computed(() => {
    void route.path;
    return buildNavigation(normalizedRole.value);
  });

  const openActiveSection = () => {
    const active = navigation.value.find(
      (section) => section.label && sectionHasActiveItem(section),
    );
    openSectionId.value =
      active?.id || navigation.value.find((s) => s.label)?.id || null;
  };

  const userName = computed(() => user.value?.fullName || user.value?.name || "مدير النظام");
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
  const roleLabel = computed(() => getUserRoleLabel(normalizedRole.value));

  /** Top-left context: branch name for employees, Customer Service for CS role */
  const contextLabel = computed(() => {
    const branchName = branch.value?.name || "";
    if (branchName) return branchName;
    if (isCustomerService.value) return "خدمة العملاء";
    return "";
  });

  watch(
    () => [route.path, normalizedRole.value],
    () => {
      openActiveSection();
      mobileNavOpen.value = false;
    },
    { immediate: true },
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

  return {
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
  };
}
