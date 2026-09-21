import { mapTimelineEvents } from "~/utils/studentOperationsReport";

/**
 * Loads operation timelines keyed by operation id.
 * Pass a fetcher so branch / customer-service can use their own endpoints.
 */
export const useOperationTimeline = (fetcher) => {
  const timelineState = reactive({});

  const ensureState = (operationId) => {
    if (!timelineState[operationId]) {
      timelineState[operationId] = {
        loading: false,
        error: "",
        payload: null,
      };
    }
    return timelineState[operationId];
  };

  const getTimelineEvents = (operationId) =>
    mapTimelineEvents(timelineState[operationId]?.payload);

  const loadTimeline = async (operationId) => {
    if (!operationId || typeof fetcher !== "function") return;

    const state = ensureState(operationId);
    state.loading = true;
    state.error = "";

    try {
      state.payload = await fetcher(operationId);
    } catch (error) {
      state.error = error?.message || "تعذر تحميل سجل العملية.";
    } finally {
      state.loading = false;
    }
  };

  const onRowExpand = (event) => {
    const operationId = event?.data?.id;
    if (operationId) loadTimeline(operationId);
  };

  return {
    timelineState,
    getTimelineEvents,
    loadTimeline,
    onRowExpand,
  };
};
