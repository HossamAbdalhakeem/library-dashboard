import { useAppToast } from "~/composables/useAppToast";
import { useAuthStore } from "~/store/auth.js";

/**
 * Self-contained admin report section loader.
 * Reloads whenever `params` or `reloadKey` change.
 * Each section owns its own loading + error state.
 */
export const useAdminReportSection = (loader, options = {}) => {
  const {
    params,
    reloadKey = ref(0),
    immediate = true,
    errorMessage = "تعذر تحميل جزء من التقارير.",
    transform = (data) => data,
    emit,
    toastOnError = false,
  } = options;

  const { showError } = useAppToast();
  const authStore = useAuthStore();
  const loading = ref(Boolean(immediate));
  const data = ref(null);
  const error = ref(null);
  let generation = 0;

  const setLoading = (value) => {
    loading.value = value;
    emit?.("loading", value);
  };

  const paramsKey = computed(() => {
    const p = unref(params) || {};
    const key = unref(reloadKey) ?? 0;
    return `${JSON.stringify({
      from: p.from || null,
      to: p.to || null,
      branchId: p.branchId || null,
      productId: p.productId || null,
      academicYearId: p.academicYearId || null,
      period: p.period || null,
    })}:${key}`;
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
    error.value = null;
    try {
      const result = await loader(current);
      if (gen !== generation) return;
      data.value = transform(result);
      error.value = null;
    } catch (err) {
      if (gen !== generation) return;
      data.value = null;
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

  watch(
    paramsKey,
    () => {
      reload();
    },
    { immediate },
  );

  return {
    loading,
    data,
    error,
    reload,
  };
};
