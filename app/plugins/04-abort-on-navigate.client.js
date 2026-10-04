import { abortRouteRequests } from "~/utils/apiFetch";

/**
 * Cancel in-flight GET requests when leaving a page.
 * The refresh navigation is not a leave: this router’s isReady() resolves
 * immediately, and app boot then replaces the current URL. Wait until the
 * first page has finished before arming cancellation.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();
  let armed = false;

  nuxtApp.hook("page:finish", () => {
    armed = true;
  });

  router.beforeEach(() => {
    if (!armed) return;
    abortRouteRequests();
  });
});
