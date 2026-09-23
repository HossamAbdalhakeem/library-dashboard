import { saleApi } from "~/services/sale";
import { useOperationTimeline } from "~/composables/useOperationTimeline";

/**
 * Sale-scoped timeline for the exchange table expander.
 * @param {() => unknown} resetDeps - watched deps that clear expanded rows
 */
export function useSalesExchangeTableTimeline(resetDeps) {
  const expandedRows = ref({});
  const { timelineState, getTimelineEvents, loadTimeline } =
    useOperationTimeline((id) => saleApi.getTimeline(id));

  const timelineKeyFor = (row) => row?.saleId || row?.id || "";

  const onRowExpand = (event) => {
    const id = timelineKeyFor(event?.data);
    if (id) loadTimeline(id);
  };

  watch(
    resetDeps,
    () => {
      expandedRows.value = {};
    },
  );

  return {
    expandedRows,
    timelineState,
    getTimelineEvents,
    loadTimeline,
    timelineKeyFor,
    onRowExpand,
  };
}
