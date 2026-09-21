import { defineStore } from "pinia";
import { authService } from "~/services/authService";
import { useLocalStorage } from "~/composables/useLocalStorage";
import { useAcademicYearStore } from "~/store/academicYear.js";

export const useAuthStore = defineStore("authStore", {
  state: () => ({
    user: {},
    token: null,
    loggedIn: false,
    loading: false,
    baseURL: useRuntimeConfig()?.public?.baseUrl || "/api",
  }),
  getters: {
    getUser: (state) => state.user,
    isLoggedIn: (state) => Boolean(state.loggedIn && state.token),
    getRole: (state) => state.user?.role || "admin",
    getRoles: (state) => state.user?.roles || [],
    getBranches: (state) => state.user?.branches || [],
  },
  actions: {
    async login(data) {
      this.loading = true;

      try {
        const response = await authService.login({
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
        const response = await authService.getCurrentUser();

        if (response?.user?.id) {
          this.setUser(response.user, response.token || token);
          return response.user;
        }

        this.removeUser();
        return null;
      } catch (error) {
        // Invalid/expired JWT — clear local session
        this.removeUser();
        throw error;
      }
    },
    async setUser(data, token) {
      this.user = data || {};
      this.token = token || this.token || null;
      this.loggedIn = Boolean(
        this.token && (this.user?.id || this.user?.phone || this.user?.role),
      );

      useLocalStorage("token").value = this.token;
      useLocalStorage("dashboard_role").value = this.user?.role || "admin";
      useLocalStorage("dashboard_user").value = JSON.stringify(this.user);
    },
    removeUser({ clearAcademicYear = true } = {}) {
      this.user = {};
      this.token = null;
      this.loggedIn = false;
      useLocalStorage("token").value = null;
      useLocalStorage("dashboard_role").value = null;
      useLocalStorage("dashboard_user").value = null;

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
        await authService.logout();
      } catch (error) {
        console.error("Logout request failed", error);
      }

      // Clear auth first so /login middleware allows the route.
      // Clear academic year AFTER navigate — otherwise mounted branch/CS pages
      // (teacher select, report filters) refetch and toast "Not authenticated"
      // without any network call (apiFetch session guard).
      this.removeUser({ clearAcademicYear: false });
      await navigateTo("/login");
      this.removeUser({ clearAcademicYear: true });
    },
    hydrateFromStorage() {
      const dashboardRole = useLocalStorage("dashboard_role");
      const dashboardUser = useLocalStorage("dashboard_user");
      const token = useLocalStorage("token");

      if (!token.value || !dashboardRole.value || !dashboardUser.value) {
        if (
          this.loggedIn ||
          this.token ||
          dashboardUser.value ||
          dashboardRole.value
        ) {
          this.removeUser();
        }
        return;
      }

      try {
        const parsed = JSON.parse(dashboardUser.value);
        this.user = parsed;
        this.token = token.value;
        this.loggedIn = true;
      } catch (error) {
        this.removeUser();
      }
    },
  },
});
