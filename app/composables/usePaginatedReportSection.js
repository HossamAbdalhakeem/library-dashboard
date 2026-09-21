import { useAppToast } from "~/composables/useAppToast";
import { useAuthStore } from "~/store/auth.js";

const extractRows = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.rows)) return payload.rows;
  return [];
};

const extractTotal = (payload) => {
  if (Array.isArray(payload)) return payload.length;
  return Number(payload?.pagination?.total ?? payload?.meta?.total ?? 0);
};

/**
 * Paginated report section loader (branch/daily tables).
 * Reloads when filter params, reloadKey, page, or extraQuery change.
 */
export const usePaginatedReportSection = (loader, options = {}) => {
  const {
    params,
    reloadKey = ref(0),
    pageSize = 15,
    extraQuery = ref({}),
    immediate = true,
    errorMessage = "تعذر تحميل البيانات.",
    toastOnError = false,
    emit,
  } = options;

  const { showError } = useAppToast();
  const authStore = useAuthStore();
  const loading = ref(Boolean(immediate));
  const rows = ref([]);
  const error = ref("");
  const total = ref(0);
  const page = ref(1);
  let generation = 0;
  let resettingPage = false;

  const setLoading = (value) => {
    loading.value = value;
    emit?.("loading", value);
  };

  const filterKey = computed(() => {
    const p = unref(params) || {};
    const extra = unref(extraQuery) || {};
    const key = unref(reloadKey) ?? 0;
    return JSON.stringify({
      from: p.from || null,
      to: p.to || null,
      branchId: p.branchId || null,
      productId: p.productId || null,
      academicYearId: p.academicYearId || null,
      period: p.period || null,
      ...extra,
      __reload: key,
    });
  });

  const reload = async () => {
    if (!authStore.isLoggedIn) {
      setLoading(false);
      return;
    }

    const current = unref(params) || {};
    if (!current.from || !current.to) {
      setLoading(false);
      return;
    }

    const gen = ++generation;
    setLoading(true);
    error.value = "";

    try {
      const extra = unref(extraQuery) || {};
      const payload = await loader({
        ...current,
        page: page.value,
        per_page: unref(pageSize),
        ...extra,
      });
      if (gen !== generation) return;
      rows.value = extractRows(payload);
      total.value = extractTotal(payload);
      error.value = "";
    } catch (err) {
      if (gen !== generation) return;
      rows.value = [];
      total.value = 0;
      error.value = err?.message || errorMessage;
      if (
        toastOnError &&
        err?.code !== "SESSION_CLEARED" &&
        err?.status !== 401
      ) {
        showError(error.value);
      }
    } finally {
      if (gen === generation) setLoading(false);
    }
  };

  const setPage = (nextPage) => {
    page.value = Math.max(1, Number(nextPage) || 1);
  };

  watch(
    filterKey,
    () => {
      resettingPage = true;
      page.value = 1;
      reload().finally(() => {
        resettingPage = false;
      });
    },
    { immediate },
  );

  watch(page, () => {
    if (resettingPage) return;
    reload();
  });

  return {
    loading,
    rows,
    error,
    total,
    page,
    setPage,
    reload,
  };
};
