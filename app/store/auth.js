import { defineStore } from "pinia";
import { authApi } from "~/services/auth";
import { useLocalStorage } from "~/composables/useLocalStorage";
import { useAcademicYearStore } from "~/store/academicYear.js";
import { UserRole, normalizeUserRole } from "~/enums/userRole";

export const useAuthStore = defineStore("authStore", {
  state: () => ({
    user: {},
    token: null,
    loggedIn: false,
    loading: false,
    /** True while 00-set-user restores session (fetchUser + fetchYears). */
    sessionLoading: true,
    baseURL: useRuntimeConfig()?.public?.baseUrl || "/api",
  }),
  getters: {
    getUser: (state) => state.user,
    isLoggedIn: (state) => Boolean(state.loggedIn && state.token),
    getRole: (state) => state.user?.role || UserRole.ADMIN,
    getRoles: (state) => state.user?.roles || [],
    getBranch: (state) => state.user?.branch || null,
  },
  actions: {
    async login(data) {
      this.loading = true;

      try {
        const response = await authApi.login({
          email: data?.email,
          password: data?.password,
        });

        this.setUser(response.user, response.token);

        const academicYearStore = useAcademicYearStore();
        await academicYearStore.fetchYears({ force: true }).catch((error) => {
          console.error("Failed to load academic years:", error);
        });

        await navigateTo("/");
        return response;
      } finally {
        this.loading = false;
      }
    },
    async fetchUser() {
      const token = this.token || useLocalStorage("token").value;
      if (!token) {
        this.removeUser();
        return null;
      }

      this.token = token;

      try {
        const response = await authApi.getCurrentUser();

        if (response?.user?.id) {
          this.setUser(response.user, response.token || token);
          return response.user;
        }

        this.removeUser();
        return null;
      } catch (error) {
        this.removeUser();
        throw error;
      }
    },
    async setUser(data, token) {
      const raw = data || {};
      const role = raw.role
        ? normalizeUserRole(raw.role, UserRole.ADMIN)
        : undefined;

      this.user = role
        ? { ...raw, role, roles: [role] }
        : { ...raw };
      this.token = token || this.token || null;
      this.loggedIn = Boolean(
        this.token && (this.user?.id || this.user?.phone || this.user?.role),
      );

      // Persist so middleware/plugin can restore session sync on refresh
      // before fetchUser validates with the API.
      useLocalStorage("token").value = this.token;
      useLocalStorage("dashboard_user").value = JSON.stringify(this.user);
    },
    removeUser({ clearAcademicYear = true } = {}) {
      this.user = {};
      this.token = null;
      this.loggedIn = false;
      useLocalStorage("token").value = null;
      useLocalStorage("dashboard_user").value = null;
      // Legacy key — stop writing it; clear leftovers from older sessions.
      useLocalStorage("dashboard_role").value = null;

      if (!clearAcademicYear) return;

      useLocalStorage("academicYearId").value = null;
      try {
        useAcademicYearStore().clear();
      } catch {
        // Pinia may not be ready during very early boot
      }
    },
    async logout() {
      try {
        // TEMP: skip logout API while testing — local session clear only
        // await authApi.logout();
      } catch (error) {
        console.error("Logout request failed", error);
      }

      this.removeUser({ clearAcademicYear: false });
      await navigateTo("/login");
      this.removeUser({ clearAcademicYear: true });
    },
    /**
     * Sync restore of token + user snapshot from localStorage.
     * Needed so route middleware can gate access before async fetchUser finishes.
     */
    hydrateFromStorage() {
      const token = useLocalStorage("token").value;
      const rawUser = useLocalStorage("dashboard_user").value;

      if (!token || !rawUser) {
        if (this.loggedIn || this.token || rawUser) {
          this.removeUser();
        }
        return;
      }

      try {
        this.setUser(JSON.parse(rawUser), token);
      } catch {
        this.removeUser();
      }
    },
  },
});
