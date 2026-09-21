import { useAuthStore } from "~/store/auth.js";

/**
 * useApi - Nuxt-aware request executor
 * Responsible for running requests with useFetch so they benefit from
 * SSR, payload transfer, hydration dedup, pending & error states.
 *
 * Usage:
 *   const { request } = useApi();
 *   const { data, pending, error } = await request(config);
 *
 * Where config comes from a CRUD module:
 *   { endpoint, method, params, body, headers }
 */
export const useApi = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const request = (requestConfig) => {
    const {
      endpoint,
      method = "GET",
      params = {},
      body,
      headers = {},
    } = requestConfig;

    const requestHeaders = { ...headers };
    if (authStore.token) {
      requestHeaders.Authorization = `Bearer ${authStore.token}`;
    }

    const requestParams = { ...params };

    const key = [
      "api",
      method,
      endpoint,
      JSON.stringify(requestParams || {}),
      JSON.stringify(body || {}),
    ].join("-");

    const result = useFetch(endpoint, {
      key,
      method,
      params: requestParams,
      headers: requestHeaders,
      body,
      baseURL: config.public.baseUrl,
      dedupe: "defer",
      getCachedData: (cachedKey, nuxtApp) => {
        if (requestConfig.cache === false) return undefined;
        return (
          nuxtApp.payload.data[cachedKey] ?? nuxtApp.static.data[cachedKey]
        );
      },
    });
    return {
      ...result,
      loading: result.pending,
    };
  };

  return { request };
};
