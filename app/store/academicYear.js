import { defineStore } from "pinia";
import { academicYearApi } from "~/services/academic-year";
import { useLocalStorage } from "~/composables/useLocalStorage";

const STORAGE_KEY = "academicYearId";

/** In-flight fetch so concurrent callers share one request. */
let fetchPromise = null;

const hasSessionToken = () => Boolean(useLocalStorage("token").value);

export const useAcademicYearStore = defineStore("academicYearStore", {
  state: () => ({
    years: [],
    loading: false,
    loaded: false,
    selectedId: null,
  }),
  getters: {
    selectedYear(state) {
      if (!state.selectedId) return null;
      return (
        state.years.find((y) => String(y.id) === String(state.selectedId)) ||
        null
      );
    },
    activeYear(state) {
      return (
        state.years.find(
          (y) => String(y.status).toUpperCase() === "ACTIVE",
        ) || null
      );
    },
    activeId() {
      return this.activeYear?.id ? String(this.activeYear.id) : null;
    },
  },
  actions: {
    hydrateSelectedId() {
      const stored = useLocalStorage(STORAGE_KEY).value;
      this.selectedId = stored ? String(stored) : null;
    },

    setSelectedId(id) {
      this.selectedId = id ? String(id) : null;
      useLocalStorage(STORAGE_KEY).value = this.selectedId;
    },

    /** Prefer stored id when still valid, otherwise ACTIVE / first year. */
    ensureSelectedId() {
      const storedId = this.selectedId
        ? String(this.selectedId)
        : useLocalStorage(STORAGE_KEY).value
          ? String(useLocalStorage(STORAGE_KEY).value)
          : null;

      const storedExists = storedId
        ? this.years.some((y) => String(y.id) === storedId)
        : false;

      if (storedExists) {
        this.selectedId = storedId;
        useLocalStorage(STORAGE_KEY).value = storedId;
        return;
      }

      const fallbackId =
        this.activeId ||
        (this.years[0]?.id ? String(this.years[0].id) : null);

      this.setSelectedId(fallbackId);
    },

    clear() {
      this.years = [];
      this.loading = false;
      this.loaded = false;
      this.selectedId = null;
      fetchPromise = null;
    },

    /**
     * Load academic years once (or again when force=true).
     * Safe to call from plugin, login, and UI components.
     */
    async fetchYears({ force = false } = {}) {
      if (!hasSessionToken()) {
        this.clear();
        return [];
      }

      if (this.loaded && !force) return this.years;
      if (fetchPromise && !force) return fetchPromise;

      this.loading = true;
      fetchPromise = (async () => {
        try {
          this.years = await academicYearApi.getAcademicYears();
          this.loaded = true;
          this.ensureSelectedId();
          return this.years;
        } catch (error) {
          if (!this.loaded) this.years = [];
          throw error;
        } finally {
          this.loading = false;
          fetchPromise = null;
        }
      })();

      return fetchPromise;
    },
  },
});
